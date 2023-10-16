import { Middleware } from 'redux';
import { io, Socket } from 'socket.io-client';
import { channelActions } from './channels.slice';
import { ChannelsEvent } from './channels.slice';
import { BACK_SOCKET_PREFIX, sockOpt } from '../helpers/API';
import { ChannelPreview } from '../interfaces/channel.interface';
import { Message } from '../interfaces/message.interface';
import { userActions, UserEvents } from './user.slice';
import { Profile } from '../interfaces/user.interface';

const channelsMiddleware: Middleware = (store) => {
	let socket: Socket;
	return (next) => (action) => {
		let isConnectionEstablished = socket && socket.connected ? true : false;
		if (channelActions.startConnecting.match(action) && !isConnectionEstablished) {
			socket = io(BACK_SOCKET_PREFIX, sockOpt);
			socket.on('connect', () => {
				store.dispatch(channelActions.connectionEstablished());
				store.dispatch(channelActions.getChannels(store.getState().user.profile.email));
			});
			socket.on(ChannelsEvent.updateStatus, (statusMap: any) => {
				store.dispatch(userActions.setStatuses(statusMap));
			});
			socket.on(ChannelsEvent.updateSearch, (search: any) => {
				store.dispatch(channelActions.setSearchUpdate(search));
			});
			socket.on(ChannelsEvent.getMessages, (messages: Message[]) => {
				store.dispatch(channelActions.setMessages(messages));
			});
			socket.on(ChannelsEvent.requestMessages, () => {
				const channel = store.getState().channel.selectedChannel;
				if (channel) {
					store.dispatch(channelActions.getMessages(channel.id));
				}
			});
			socket.on(ChannelsEvent.requestPrevies, () => {
				const profile = store.getState().user.profile;
				if (profile) {
					store.dispatch(channelActions.getChannels(profile.email));
				}
			});
			socket.on(ChannelsEvent.updatePreview, (channels: ChannelPreview[]) => {
				store.dispatch(channelActions.setChannels({ channels: channels }));
			});
			socket.on(ChannelsEvent.AddPreview, (channel: ChannelPreview) => {
				store.dispatch(channelActions.setChannel({ channel: channel }));
			});
			socket.on(ChannelsEvent.update, () => {
				if (store.getState().user.profile && store.getState().channel.selectedChannel) {
					socket.emit(ChannelsEvent.readChannelStatus, { email: store.getState().user.prodile.email, channelId: store.getState().channel.selectedChannel.id });
					socket.emit(ChannelsEvent.getPreview, store.getState().user.profile.email, (channels: ChannelPreview[]) => {
						store.dispatch(channelActions.setChannels({ channels }));
					});
					if (store.getState().channel.selectedChannel) {
						store.dispatch(
							channelActions.getMessages(
								store.getState().channel.selectedChannel.id
							)
						);
					}
				}
			});
			socket.on(ChannelsEvent.channelCreated, (channel: ChannelPreview) => {
				store.dispatch(channelActions.setSelectedChannel(channel));
			});
			socket.on(ChannelsEvent.getError, (error: any) => {
				if (error.errors && error.errors[0]) {
					store.dispatch(channelActions.setError(error.errors[0].message));
				} else if (typeof error === 'string') {
					store.dispatch(channelActions.setError(error));
				}
			});
			socket.on(ChannelsEvent.getSelectedChannel, (channel: any) => {
				store.dispatch(channelActions.setSelectedChannel(channel));
			});
			socket.on(ChannelsEvent.getDirectChannel, (channelId: number) => {
				store.dispatch(channelActions.getSelectedChannel(channelId));
			});
			socket.on(ChannelsEvent.getMembers, (members: any[]) => {
				store.dispatch(channelActions.setMembers(members));
			});

			socket.on(UserEvents.updateProfile, (profile: Profile) => {
				store.dispatch(userActions.updateProfile(profile));
			});
			socket.on(UserEvents.getGameHistory, (gameHistory: any) => {
				store.dispatch(userActions.setGameHistory(gameHistory));
			});
			socket.on(UserEvents.getFriends, (friends: any[]) => {
				store.dispatch(userActions.setFriends(friends));
			});
			socket.on(UserEvents.getLeaderboard, (leaderboard: any[]) => {
				store.dispatch(userActions.setLeaderboard(leaderboard));
			});
		}
		if (channelActions.createChannel.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.createChannel, action.payload);
		}
		if (channelActions.getChannels.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.getPreview, action.payload, (channels: ChannelPreview[]) => {
				store.dispatch(channelActions.setChannels({ channels }));
			});
		}
		if (channelActions.sendMessage.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.sendMessage, action.payload);
		}
		if (channelActions.getMessages.match(action) && isConnectionEstablished) {
			if (action.payload != -1) {
				socket.emit(ChannelsEvent.getMessages, action.payload);
			}
		}
		if (channelActions.getChannel.match(action) && isConnectionEstablished) {
			if (action.payload != -1) {
				socket.emit(ChannelsEvent.AddPreview, { email: store.getState().user.profile.email, channelId: action.payload });
			}
		}
		if (channelActions.getUpdateSearch.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.getUpdateSearch, store.getState().user.profile.email);
		}
		if (channelActions.getSelectedChannel.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.getSelectedChannel, { email: store.getState().user.profile.email, channelId: action.payload });
		}
		if (channelActions.getDirectChannel.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.getDirectChannel, {
				id: action.payload.targetId,
				email: action.payload.selfEmail,
			});
		}
		if (channelActions.readChannelStatus.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.readChannelStatus, action.payload);
		}
		if (channelActions.joinChannel.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.joinChannel, action.payload);
		}
		if (channelActions.leaveChannel.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.leaveChannel, action.payload);
		}
		if (channelActions.makeAdmin.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.makeAdmin, action.payload);
		}
		if (channelActions.removeAdmin.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.removeAdmin, action.payload);
		}
		if (channelActions.blockMember.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.blockMember, action.payload);
		}
		if (channelActions.unblockMember.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.unblockMember, action.payload);
		}
		if (channelActions.kickMember.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.kickMember, action.payload);
		}
		if (channelActions.muteMember.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.muteMember, action.payload);
		}
		if (channelActions.unmuteMember.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.unmuteMember, action.payload);
		}
		if (channelActions.updateChannel.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.updateChannel, action.payload);
		}
		if (channelActions.deleteChannel.match(action) && isConnectionEstablished) {
			socket.emit(ChannelsEvent.deleteChannel, action.payload);
		}

		if (userActions.addFriend.match(action) && isConnectionEstablished) {
			socket.emit(UserEvents.addFriend, {
				selfId: action.payload.selfId,
				friendId: action.payload.friendId,
			});
		}
		if (userActions.removeFriend.match(action) && isConnectionEstablished) {
			socket.emit(UserEvents.removeFriend, {
				selfId: action.payload.selfId,
				friendId: action.payload.friendId,
			});
		}
		if (userActions.blockUser.match(action) && isConnectionEstablished) {
			socket.emit(UserEvents.blockUser, {
				selfId: action.payload.selfId,
				friendId: action.payload.friendId,
			});
		}
		if (userActions.unblockUser.match(action) && isConnectionEstablished) {
			socket.emit(UserEvents.unblockUser, {
				selfId: action.payload.selfId,
				friendId: action.payload.friendId,
			});
		}
		if (userActions.getGameHistory.match(action) && isConnectionEstablished) {
			socket.emit(UserEvents.getGameHistory, action.payload);
		}
		if (userActions.getFriends.match(action) && isConnectionEstablished) {
			socket.emit(UserEvents.getFriends, action.payload);
		}
		if (userActions.getLeaderboard.match(action) && isConnectionEstablished) {
			socket.emit(UserEvents.getLeaderboard);
		}
		next(action);
	};
};

export default channelsMiddleware;
