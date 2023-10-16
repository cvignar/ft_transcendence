import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { BACK_PREFIX } from '../helpers/API';
import { ChannelPreview } from '../interfaces/channel.interface';
import { loadState } from './storage';

export const CART_PERSISTENT_STATE = 'cartData';

export interface ChatState {
	items: ChannelPreview[];

}

const initialState: ChatState = loadState<ChatState>(CART_PERSISTENT_STATE) ?? {
	items: []
};

export const getMessages = createAsyncThunk('messages/show',
	async () => {
		try {
			const { data } = await axios.get(`${BACK_PREFIX}/channel/show`);
			return data;
		} catch (e) {
			if (e instanceof AxiosError) {
				throw new Error(e.response?.data.message);
			}
		}
	}
);

export const messagesSlice = createSlice({
	name: 'channel',
	initialState,
	reducers: {

	},
	extraReducers: (builder) => {
		builder.addCase(getMessages.fulfilled, (state, action) => {
			if (!action.payload) {
				return;
			}
			action.payload.map(i => state.items.push(i));
			state = action.payload;
		});
		builder.addCase(getMessages.rejected, () => {
			//state.authErrorMessage = action.error.message;
		});

	}
});

export default messagesSlice.reducer;
export const channelActions = messagesSlice.actions;