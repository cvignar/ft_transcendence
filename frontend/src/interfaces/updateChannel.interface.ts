import { typeEnum } from '../../../contracts/enums';

export interface UpdateChannel {
	id: number,
	type: typeEnum,
	email: string,
	password: string | null,
	memberId: number,
	newPassword: string | null,
}
