import { configureStore } from '@reduxjs/toolkit';
import channelsMiddleware from './channels.middleware';
import channelSlice from './channels.slice';
import { saveState } from './storage';
import userSlice, { EMAIL_PERSISTENT_STATE, JWT_PERSISTENT_STATE, LEADERBOARD_PRSISTENT_STATE, PROFILE_PERSISTENT_STATE, USERID_PERSISTENT_STATE, USERNAME_PERSISTENT_STATE } from './user.slice';
import {applyMiddleware} from '@reduxjs/toolkit';

export const store = configureStore({
	reducer: {
		user: userSlice,
		channel: channelSlice
	},
	middleware: (getDefaultMiddleware) => {
		return getDefaultMiddleware({
			serializableCheck: false
		}).concat([channelsMiddleware]);
	}
});
	

store.subscribe(() => {
	saveState(store.getState().user.token, JWT_PERSISTENT_STATE);
	saveState(store.getState().user.userId, USERID_PERSISTENT_STATE);
	saveState(store.getState().user.email, EMAIL_PERSISTENT_STATE);
	saveState(store.getState().user.username, USERNAME_PERSISTENT_STATE);
	saveState(store.getState().user.profile, PROFILE_PERSISTENT_STATE);
	saveState(store.getState().user.statuses, 'statuses');
	saveState(store.getState().user.leaderboard, LEADERBOARD_PRSISTENT_STATE);
	saveState(store.getState().user.selectedUser, 'selectedUser');
	saveState(store.getState().channel.selectedChannel, 'selectedChannel');
	saveState(store.getState().channel.messages, 'messages');
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;