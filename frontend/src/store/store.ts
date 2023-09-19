import { configureStore } from '@reduxjs/toolkit';
import channelSlice from './channel.slice';
import { saveState } from './storage';
import userSlice, { EMAIL_PERSISTENT_STATE, JWT_PERSISTENT_STATE } from './user.slice';

export const store = configureStore({
	reducer: {
		user: userSlice,
		channel: channelSlice
	}
});

store.subscribe(() => {
	saveState(store.getState().user.token, JWT_PERSISTENT_STATE);
	saveState(store.getState().user.email, EMAIL_PERSISTENT_STATE);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;