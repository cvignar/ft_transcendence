export const BACK_PREFIX = `http://${import.meta.env.VITE_BACK_HOST}:${import.meta.env.VITE_BACK_PORT}`;//FIXME!!!! ENV!!!!
export const BACK_SOCKET_PREFIX = `ws://${import.meta.env.VITE_BACK_HOST}:${import.meta.env.VITE_BACK_PORT}`;//FIXME!!!! ENV!!!!

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
