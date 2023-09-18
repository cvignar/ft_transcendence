import { io } from 'socket.io-client';
import { typeEnum } from '../../../contracts/enums';

export const INITIAL_CHANNEL = {
	id: -1,
	type: typeEnum.PUBLIC,
	name: '',
	picture: '',
	updatedAt: new Date('now'),
	lastMessage: '',
	unreadCount: 0,
	ownerEmail: '',
	ownerId: -1
};

const sockOpt = {
	transportOptions: {
		polling: {
			extraHeaders: {
				Token: localStorage.getItem('userToken')
			}
		}
	}
};


export const socket = io('ws://127.0.0.1:3000', sockOpt);//FIXME!!!
