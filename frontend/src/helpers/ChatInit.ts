import { io } from 'socket.io-client';
import { typeEnum } from '../../../contracts/enums';
import { BACK_SOCKET_PREFIX } from './API';

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
	transposts: ['websocket'],
	transportOptions: {
		polling: {
			extraHeaders: {
				Token: localStorage.getItem('userToken')?.replace(/"/g, '')
			}
		}
	}
};


//export const socket = io(`${BACK_SOCKET_PREFIX}`, sockOpt);//FIXME!!!
