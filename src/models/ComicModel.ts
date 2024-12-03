import { MediaTypeModel } from './MediaTypeModel';
import { mediaDbTag, migrateObject } from '../utils/Utils';
import { MediaType } from '../utils/MediaType';

export class ComicModel extends MediaTypeModel {
	publisher: string[];
	issues: string[];
	description: string;
	image: string;

	released: boolean;
	releaseDate: string;

	userData: {
		read: boolean;
		personalRating: number;
	};

	constructor(obj: any = {}) {
		super();

		this.publisher = undefined;
        this.issues = undefined;
		this.released = undefined;
		this.image = undefined;
		this.userData = {
			read: undefined,
			personalRating: undefined,
		};

		migrateObject(this, obj, this);

		if (!obj.hasOwnProperty('userData')) {
			migrateObject(this.userData, obj, this.userData);
		}

		this.type = this.getMediaType();
	}

	getTags(): string[] {
		return [mediaDbTag, 'comic'];
	}

	getMediaType(): MediaType {
		return MediaType.Comic;
	}

	getSummary(): string {
		return this.englishTitle + ' (' + this.year + ')';
	}
}
