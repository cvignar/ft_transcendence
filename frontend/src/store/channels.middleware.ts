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
				store.dispatch(channelActions.getChannels(store.getState().user.email));

				//socket.emit(ChannelsEvent.getPreview, store.getState().user.email, (channels: ChannelPreview[]) => {
				//	store.dispatch(channelActions.getChannels({ channels }));
				//});
			});
			socket.on(ChannelsEvent.getMessages, (messages: Message[]) => {
				store.dispatch(channelActions.setMessages(messages));
			});
			socket.on(ChannelsEvent.recieveMessage, (message: Message) => {
				store.dispatch(channelActions.recieveMessage(message));
			});
			socket.on(ChannelsEvent.updatePreview, (channels: ChannelPreview[]) => {
				store.dispatch(channelActions.setChannels({channels: channels}));
			});
			socket.on(ChannelsEvent.AddPreview, (channel: ChannelPreview) => {
				store.dispatch(channelActions.getChannel({channel: channel}));
			});
			socket.on(ChannelsEvent.update, () => {
				store.dispatch(channelActions.updateState());
				//socket.emit(ChannelsEvent.getPreview, store.getState().user.email, (channels: ChannelPreview[]) => {
				//	store.dispatch(channelActions.getChannels({ channels }));
				//});
			});
 
			//socket.on(ChannelsEvent.ReceiveMessage, (channel: ChannelPreview) => {
			//	store.dispatch(channelActions.getChannel({ channel }));
			//});
		}
 
		if (channelActions.createChannel.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.createChannel, action.payload);
		}
		if (channelActions.getChannels.match(action) && isConnectionEstablished) {
			console.log('GET!');
			socket.emit(ChannelsEvent.getPreview, action.payload, (channels: ChannelPreview[]) => {
				store.dispatch(channelActions.setChannels({ channels }));
			});
		}
 
		if (channelActions.sendMessage.match(action) && isConnectionEstablished) {
			console.log(action.payload);
			socket.emit(ChannelsEvent.sendMessage, action.payload);
		}
		if (channelActions.getMessages.match(action) && isConnectionEstablished) {
			if (action.payload != -1) {
				socket.emit(ChannelsEvent.getMessages, action.payload);
			}
		}
		next(action);
	};
};

export default channelsMiddleware;