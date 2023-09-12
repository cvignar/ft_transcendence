import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { BACK_PREFIX } from '../helpers/API';
import { ChannelPreview } from '../interfaces/channel.interface';
import { loadState } from './storage';

export const CART_PERSISTENT_STATE = 'cartData';

//export interface ChatItem {
//  id: number
//  name: string
//  picture?: string 
//  createdAt: string
//  updatedAt: string
//  type: string
//  password?: string
//}
export interface ChatState {
	items: ChannelPreview[];

}

const initialState: ChatState = loadState<ChatState>(CART_PERSISTENT_STATE) ?? {
	items: []
};

export const getChannels = createAsyncThunk('channel/show',
	async () => {
		try {
			//console.log(params);
			const { data } = await axios.get(`${BACK_PREFIX}/channel/show`);
			console.log(data);
			return data;
		} catch (e) {
			if (e instanceof AxiosError) {
				throw new Error(e.response?.data.message);
			}
		}
	}
);

export const channelSlice = createSlice({
	name: 'channel',
	initialState,
	reducers: {

	},
	extraReducers: (builder) => {
		builder.addCase(getChannels.fulfilled, (state, action) => {
			if (!action.payload) {
				return;
			}
			action.payload.map(i => state.items.push(i));
			state = action.payload;
			console.log(action.payload);
		});
		builder.addCase(getChannels.rejected, () => {
			//state.authErrorMessage = action.error.message;
		});

	}
});

export default channelSlice.reducer;
export const channelActions = channelSlice.actions;