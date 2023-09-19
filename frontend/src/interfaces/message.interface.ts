export default interface Message {
	id: number,
	msg: string,
	createdAt: Date,
	updatedAt: Date,
	ownerName: string,
	ownerId: number,
	channelId: number,
	email: string,
	invite: boolean,

};