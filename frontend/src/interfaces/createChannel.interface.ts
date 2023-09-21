import { typeEnum } from '../../../contracts/enums';

export interface CreateChannel {
	name: string,
	type: typeEnum,
	password?: string,
	email: string,
	members: {
		id: number,
		name: string,
	}[],
}