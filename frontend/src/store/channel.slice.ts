import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { Socket } from 'socket.io-client';
import { BACK_PREFIX } from '../helpers/API';
import { ChannelPreview } from '../interfaces/channel.interface';
import { loadState } from './storage';


enum ChannelEvent {
  SendMessage = 'send_message',
  RequestAllMessages = 'request_all_messages',
  SendAllMessages = 'send_all_messages',
  ReceiveMessage = 'receive_message'
}

export interface ChannelState {
  isEstablishingConnection: boolean;
  isConnected: boolean;
}
 
const initialState: ChannelState = {
	isEstablishingConnection: false,
	isConnected: false
};
 
const channelSlice = createSlice({
	name: 'channel',
	initialState,
	reducers: {
		startConnecting: (state => {
			state.isEstablishingConnection = true;
		}),
		connectionEstablished: (state => {
			state.isConnected = true;
			state.isEstablishingConnection = true;
		})
	}
});
 
export const channelActions = channelSlice.actions;
 
export default channelSlice;

//export const CART_PERSISTENT_STATE = 'cartData';
//export interface ChatState {
//	items: ChannelPreview[];

//}

//const initialState: ChatState = loadState<ChatState>(CART_PERSISTENT_STATE) ?? {
//	items: []
//};

//export const socketMiddleware = (socket: Socket) => (params: any) => (next: ) => (action) => {
//	const { dispatch, getState } = params;
//	const { type } = action;

//	switch (type) {
//	case 'socket/connect':
//		socket.connect('wss://example.com');

//		socket.on('open', () => {});
//		socket.on('message', (data) => {});
//		socket.on('close', () => {});
//		break;

//	case 'socket/disconnect':
//		socket.disconnect();
//		break;

//	default:
//		break;
//	}

//	return next(action);
//};

//export const getChannels = createAsyncThunk('channel/show',
//	async () => {
//		try {
//			//console.log(params);
//			//const { data } = await axios.get(`${BACK_PREFIX}/channel/show`);
//			//console.log(data);
//			//return data;
//		} catch (e) {
//			if (e instanceof AxiosError) {
//				throw new Error(e.response?.data.message);
//			}
//		}
//	}
//);

//export const channelSlice = createSlice({
//	name: 'channel',
//	initialState,
//	reducers: {

//	},
//	extraReducers: (builder) => {
//		builder.addCase(getChannels.fulfilled, (state, action) => {
//			if (!action.payload) {
//				return;
//			}
//			action.payload.map(i => state.items.push(i));
//			state = action.payload;
//		});
//		builder.addCase(getChannels.rejected, () => {
//			//state.authErrorMessage = action.error.message;
//		});

//	}
//});

//export default channelSlice.reducer;
//export const channelActions = channelSlice.actions;