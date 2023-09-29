export interface Message {
	id: number,
	msg: string,
	createdAt: Date,
	updatedAt: Date,
	cid: number,
	owner: {
		id: number,
		email: string,
		username: string,
		avatar: string,
	}
}