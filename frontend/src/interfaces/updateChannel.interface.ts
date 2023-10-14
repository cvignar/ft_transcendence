import { typeEnum } from '../../../contracts/enums';

export interface updateChannel {
	id: number,
	type: typeEnum,
	email: string,
	password: string | null,
	memberId: number,
	newPassword: string | null,
}
