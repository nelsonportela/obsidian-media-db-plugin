import { APIModel } from '../APIModel';
import { MediaTypeModel } from '../../models/MediaTypeModel';
import MediaDbPlugin from '../../main';
import { ComicModel } from '../../models/ComicModel';
import { requestUrl } from 'obsidian';
import { MediaType } from '../../utils/MediaType';

export class ComicVineAPI extends APIModel {
	plugin: MediaDbPlugin;
	apiDateFormat: string = 'YYYY-MM-DD';

	constructor(plugin: MediaDbPlugin) {
		super();

		this.plugin = plugin;
		this.apiName = 'ComicVineAPI';
		this.apiDescription = 'A free API for comics.';
		this.apiUrl = 'https://comicvine.gamespot.com/api';
		this.types = [MediaType.Comic];
	}
	async searchByTitle(title: string): Promise<MediaTypeModel[]> {
		console.log(`MDB | api "${this.apiName}" queried by Title`);

		if (!this.plugin.settings.ComicVineKey) {
			throw Error(`MDB | API key for ${this.apiName} missing.`);
		}

		const searchUrl = `${this.apiUrl}/search?api_key=${this.plugin.settings.ComicVineKey}&query=${encodeURIComponent(title)}&limit=10&resources=volume&format=json`;
		const fetchData = await requestUrl({
			url: searchUrl,
		});

		// console.debug(fetchData);

		if (fetchData.status === 401) {
			throw Error(`MDB | Authentication for ${this.apiName} failed. Check the API key.`);
		}
		if (fetchData.status === 429) {
			throw Error(`MDB | Too many requests for ${this.apiName}, you've exceeded your API quota.`);
		}
		if (fetchData.status !== 200) {
			throw Error(`MDB | Received status code ${fetchData.status} from ${this.apiName}.`);
		}

		const data = await fetchData.json;
		// console.debug(data);
		const ret: MediaTypeModel[] = [];
		for (const result of data.results) {
			ret.push(
				new ComicModel({
					type: MediaType.Comic,
					title: result.name,
					englishTitle: result.name,
					year: new Date(result.start_year).getFullYear().toString(),
					dataSource: this.apiName,
					id: result.id,
				} as ComicModel),
			);
		}

		return ret;
	}

	async getById(id: string): Promise<MediaTypeModel> {
		console.log(`MDB | api "${this.apiName}" queried by ID`);

		if (!this.plugin.settings.ComicVineKey) {
			throw Error(`MDB | API key for ${this.apiName} missing.`);
		}

		const searchUrl = `${this.apiUrl}/volume/${encodeURIComponent(id)}/?api_key=${this.plugin.settings.ComicVineKey}&format=json`;
		const fetchData = await requestUrl({
			url: searchUrl,
		});
		console.debug(fetchData);

		if (fetchData.status !== 200) {
			throw Error(`MDB | Received status code ${fetchData.status} from ${this.apiName}.`);
		}

		const data = await fetchData.json;
		// console.debug(data);
		const result = data.results;

		return new ComicModel({
			type: MediaType.Comic,
			title: result.name,
			englishTitle: result.name,
			year: new Date(result.start_year).getFullYear().toString(),
			dataSource: this.apiName,
			url: result.site_detail_url,
			id: result.id,
			issues: result.issues?.map((x: any) => x.issue_number) ?? [],
			publishers: result.publisher?.map((x: any) => x.name) ?? [],
			image: result.image?.super_url ?? '',

			released: true,
			releaseDate: result.original_release_date ?? 'unknown',

			userData: {
				played: false,

				personalRating: 0,
			},
		} as ComicModel);
	}
}
