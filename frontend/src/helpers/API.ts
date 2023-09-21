export const BACK_PREFIX = 'http://localhost:3000';//FIXME!!!! ENV!!!!
export const BACK_SOCKET_PREFIX = 'ws://localhost:3000';//FIXME!!!! ENV!!!!

export const sockOpt = {
	transposts: ['websocket'],
	transportOptions: {
		polling: {
			extraHeaders: {
				Token: localStorage.getItem('userToken')?.replace(/"/g, '')
			}
		}
	}
};
