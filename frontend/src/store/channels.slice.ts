import { createAsyncThunk, createSlice, isAction, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { Socket } from 'socket.io-client';
import { typeEnum } from '../../../contracts/enums';
import { BACK_PREFIX } from '../helpers/API';
import { ChannelPreview } from '../interfaces/channel.interface';
import { CreateChannel } from '../interfaces/createChannel.interface';
import { CreateMessage } from '../interfaces/createMessage.interface';
import { Message } from '../interfaces/message.interface';
import { loadState } from './storage';
import { UpdateChannel } from '../interfaces/updateChannel.interface';

export enum ChannelsEvent {
	AddPreview = 'add preview',
	getBlocked = 'get blocked',
	getError = 'exception',
	update = 'update channel request',
	updatePreview = 'update preview',
	getPreview = 'get preview',
	getMembers = 'get members',
	updateSearch = 'update search',
	getUpdateSearch = 'get search update',
	getOwners = 'get owners',
	getAdmins = 'get admins',
	getInvoteds = 'get inviteds',
	getOwner = 'get owner',
	filter = 'filter',
	getMessages = 'get messages',
	getRole = 'get role',
	sendMessage = 'new message',
	createChannel = 'create channel',
	getSelectedChannel = 'get selected channel',
	updateStatus = 'update-status',
	getDirectChannel = 'get direct channel',
	readChannelStatus = 'read channel status',
	joinChannel = 'join channel',
	leaveChannel = 'leave channel',
	makeAdmin = 'make admin',
	removeAdmin = 'remove admin',
	channelCreated = 'channel created',
	blockMember = 'block member',
	unblockMember = 'unblock member',
	kickMember = 'kick member',
	muteMember = 'mute member',
	unmuteMember = 'unmute member',
	updateChannel = 'update channel',
	deleteChannel = 'delete channel',
	requestMessages = 'request messages',
	requestPrevies = 'request previews'
}

export interface ChannelsState {
	channels: ChannelPreview[];
	messages: Message[];
	selectedChannel: ChannelPreview;
	search: any[];

	isEstablishingConnection: boolean;
	isConnected: boolean;
	state: number;
	error?: any;
	members: any[];
}

const initialState: ChannelsState = {
	channels: [],
	messages: loadState<Message[]>('messages') ?? [],
	selectedChannel: loadState<ChannelPreview>('selectedChannel') ?? {
		id: -1,
		type: typeEnum.PUBLIC,
		name: '',
		picture: '',
		updatedAt: new Date('now').toDateString(),
		lastMessage: '',
		unreadCount: 0,
		ownerEmail: '',
		ownerId: -1,
		tag: '',
	},
	search: [],
	isEstablishingConnection: false,
	isConnected: false,
	state: 0,
	members: [],
};

export const uploadChannelAvatar = createAsyncThunk("/uploadChannelAvatar", async (input_data: {channelId: number, img_data: FormData}) => {
	try {
		const { data } = await axios.post<any>(`${BACK_PREFIX}/channel/uploadAvatar/${input_data.channelId}`, input_data.img_data, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		});
		return data;
	} catch (e) {
		if (e instanceof AxiosError) {
			throw new Error(e.response?.data.message);
		}
	}
});

const channelSlice = createSlice({
	name: 'channels',
	initialState,
	reducers: {
		logout: (state) => {
			state.channels = [];
			state.messages = [];
			state.search = [];
			state.isConnected = false;
			state.isEstablishingConnection = false;
			state.state = 0;
			state.error = null;
			state.members = [];
			state.selectedChannel = {
				id: -1,
				type: typeEnum.PUBLIC,
				name: '',
				picture: '',
				updatedAt: new Date('now').toDateString(),
				lastMessage: '',
				unreadCount: 0,
				ownerEmail: '',
				ownerId: -1,
				tag: '',
			};
		},
		clearError: (state) => {
			state.error = null;
		},
		startConnecting: (state) => {
			state.isEstablishingConnection = true;
		},
		connectionEstablished: (state) => {
			state.isConnected = true;
			state.isEstablishingConnection = true;
		},
		connsctionNotEstablished: (state) => {
			state.isConnected = false;
			state.isEstablishingConnection = false;
		},
		getChannel: (state, action: PayloadAction<number>) => {
			return;
		},
		setChannel: (
			state,
			action: PayloadAction<{
				channel: ChannelPreview;
			}>
		) => {
			//if ()
			state.channels.unshift(action.payload.channel);
		},
		getChannels: (state, action: PayloadAction<string | undefined>) => {
			return;
		},
		setChannels: (state, action: PayloadAction<{ channels: ChannelPreview[] }>) => {
			state.channels = action.payload.channels;
		},
		sendMessage: (state, action: PayloadAction<CreateMessage>) => {
			return;
		},
		getMessages: (state, action: PayloadAction<number>) => {
			return;
		},
		setMessages: (state, action: PayloadAction<Message[]>) => {
			state.messages = action.payload;
		},
		recieveMessage: (state, action: PayloadAction<Message>) => {
			if (!state.messages.includes(action.payload)) {
				state.messages.push(action.payload);
			}
		},
		createChannel: (state, action: PayloadAction<CreateChannel>) => {
			return;
		},
		updateState: (state) => {
			state.state = state.state + 1;
		},
		setError: (state, action: PayloadAction<string>) => {
			state.error = action.payload;
		},
		getUpdateSearch: (state) => {
			return;
		},
		setSearchUpdate: (state, action: PayloadAction<any>) => {
			state.search = action.payload;
		},
		getSelectedChannel: (state, action: PayloadAction<any>) => {
			return;
		},
		setSelectedChannel: (state, action: PayloadAction<any>) => {
			state.selectedChannel = action.payload;
		},
		getDirectChannel: (state, action: PayloadAction<{ targetId: number; selfEmail: string }>) => {
			return;
		},
		readChannelStatus: (state, action: PayloadAction<{ channelId: number; email: string }>) => {
			return;
		},
		setMembers: (state, action: PayloadAction<any[]>) => {
			state.members = action.payload;
		},
		joinChannel: (state, action: PayloadAction<any>) => {
			return;
		},
		leaveChannel: (state, action: PayloadAction<any>) => {
			return;
		},
		makeAdmin: (state, action: PayloadAction<{ userId: number; channelId: number }>) => {
			return;
		},
		removeAdmin: (state, action: PayloadAction<{ userId: number; channelId: number }>) => {
			return;
		},
		blockMember: (state, action: PayloadAction<{ userId: number; channelId: number }>) => {
			return;
		},
		unblockMember: (state, action: PayloadAction<{ userId: number; channelId: number }>) => {
			return;
		},
		kickMember: (state, action: PayloadAction<{ userId: number; channelId: number }>) => {
			return;
		},
		muteMember: (state, action: PayloadAction<{ finishAt: string; userId: number; channelId: number }>) => {
			return;
		},
		unmuteMember: (state, action: PayloadAction<{ userId: number; channelId: number }>) => {
			return;
		},
		updateChannel: (state, action: PayloadAction<UpdateChannel>) => {
			return;
		},
		deleteChannel: (state, action: PayloadAction<number>) => {
			return;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(uploadChannelAvatar.fulfilled, (state, action) => {
			state.selectedChannel.picture = action.payload;
			return;
		});
		builder.addCase(uploadChannelAvatar.rejected, (state, action) => {
			state.error = action.error.message;
		});
	},
});

export const channelActions = channelSlice.actions;

export default channelSlice.reducer;