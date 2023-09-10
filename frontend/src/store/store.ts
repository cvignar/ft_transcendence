import { configureStore } from '@reduxjs/toolkit';
import { saveState } from './storage';
import userSlice, { ID42_PERSISTENT_STATE } from './user.slice';

export const store = configureStore({
	reducer: {
		user: userSlice
	}
});

store.subscribe(() => {
	saveState({ id42: store.getState().user.id42 }, ID42_PERSISTENT_STATE);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;