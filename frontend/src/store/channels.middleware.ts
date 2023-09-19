import { Middleware } from 'redux';
import { io, Socket } from 'socket.io-client';
import { channelActions } from './channels.slice';
import { ChannelsEvent } from './channels.slice';
import { BACK_SOCKET_PREFIX, sockOpt } from '../helpers/API';
import { ChannelPreview } from '../interfaces/channel.interface';
 
const channelsMiddleware: Middleware = store => {
	let socket: Socket;
	return next => (action) => {
		const isConnectionEstablished = socket && store.getState().channel.isConnected;
		console.log(action);
		if (channelActions.startConnecting.match(action)) {
			socket = io(BACK_SOCKET_PREFIX, sockOpt);
			socket.on('connect', () => {
				store.dispatch(channelActions.connectionEstablished());
				socket.emit(ChannelsEvent.getPreview, store.getState().user.email, (channels: ChannelPreview[]) => {
					store.dispatch(channelActions.getChannels({ channels }));
				});
			});
 
			socket.on(ChannelsEvent.updatePreview, (channels: ChannelPreview[]) => {
				store.dispatch(channelActions.getChannels({ channels }));
			});
 
			//socket.on(ChannelsEvent.ReceiveMessage, (channel: ChannelPreview) => {
			//	store.dispatch(channelActions.getChannel({ channel }));
			//});
		}
 
		//if (channelActions.createChannel.match(action) && isConnectionEstablished) {
		//	socket.emit(ChannelsEvent.createChannel, action.payload.content);
		//}
		if (channelActions.getChannels.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.getPreview, action.payload.channels);
		}
 
		next(action);
	};
};

export default channelsMiddleware;