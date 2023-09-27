export interface Message {
	id: number,
	msg: string,
	createdAt: Date,
	updatedAt: Date,
	owner: {
		id: number,
		email: string,
		username: string,
		avatar: string,
	}
}