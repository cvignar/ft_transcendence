import { Middleware } from 'redux';
import { io, Socket } from 'socket.io-client';
import { channelActions } from './channels.slice';
import { ChannelsEvent } from './channels.slice';
import { BACK_SOCKET_PREFIX, sockOpt } from '../helpers/API';
import { ChannelPreview } from '../interfaces/channel.interface';
import { Message } from '../interfaces/message.interface';
 
const channelsMiddleware: Middleware = store => {
	let socket: Socket;
	return next => (action) => {
		const isConnectionEstablished = socket && store.getState().channel.isConnected;
		console.log(action);
		if (channelActions.startConnecting.match(action)) {
			socket = io(BACK_SOCKET_PREFIX, sockOpt);
			socket.on('connect', () => {
				store.dispatch(channelActions.connectionEstablished());
				if (store.getState().channel.channels.length == 0) {
					socket.emit(ChannelsEvent.getPreview, store.getState().user.email, (channels: ChannelPreview[]) => {
						store.dispatch(channelActions.getChannels({ channels }));
					});
				}
			});
 
			socket.on(ChannelsEvent.getMessages, (messages: Message[]) => {
				console.log('set msgs ', messages.forEach);
				store.dispatch(channelActions.setMessages(messages));
			});
			socket.on(ChannelsEvent.recieveMessage, (message: Message) => {
				store.dispatch(channelActions.recieveMessage(message));
			});
			socket.on(ChannelsEvent.updatePreview, (channels: ChannelPreview[]) => {
				store.dispatch(channelActions.getChannels({channels: channels}));
			});

			//socket.on(ChannelsEvent.updatePreview, (channels: ChannelPreview[]) => {
			//	store.dispatch(channelActions.getChannels({ channels }));
			//});
 
			//socket.on(ChannelsEvent.ReceiveMessage, (channel: ChannelPreview) => {
			//	store.dispatch(channelActions.getChannel({ channel }));
			//});
		}
 
		//if (channelActions.createChannel.match(action) && isConnectionEstablished) {
		//	socket.emit(ChannelsEvent.createChannel, action.payload.content);
		//}
		if (channelActions.getChannels.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.getPreview, store.getState().user.email, (channels: ChannelPreview[]) => {
				if (store.getState().channel.channels.length == 0) {
					store.dispatch(channelActions.getChannels({ channels }));
				}
			});
		}
 
		if (channelActions.sendMessage.match(action) && isConnectionEstablished) {
			console.log(action.payload);
			socket.emit(ChannelsEvent.sendMessage, action.payload);
		}
		if (channelActions.getMessages.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.getMessages, action.payload);
		}
		next(action);
	};
};

export default channelsMiddleware;