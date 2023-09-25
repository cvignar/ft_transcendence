import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { BACK_PREFIX } from '../helpers/API';
import { AuthResponse } from '../interfaces/auth.interface';
import { Profile } from '../interfaces/user.interface';
import { loadState } from './storage';
//import { RootState } from './store';

export const JWT_PERSISTENT_STATE = 'userToken';
export const EMAIL_PERSISTENT_STATE = 'userEmail';
export const USERNAME_PERSISTENT_STATE = 'userName';
export const USERID_PERSISTENT_STATE = 'userId';
export const AVATAR_PERSISTENT_STATE = 'userAvatar';

export interface UserState {
	token: string | null;
	email?: string;
	//id42: string | null;
	authErrorMessage?: string;
	username?: string;
	userId: number | null;
	profile?: Profile;
	//profileError?: string;
	//registerError?: string;
}


const initialState: UserState = {
	token: loadState<string>(JWT_PERSISTENT_STATE) ?? null,
	email: loadState<string>(EMAIL_PERSISTENT_STATE) ?? '',
	username: loadState<string>(USERNAME_PERSISTENT_STATE) ?? '',
	userId: loadState<number | null>(USERID_PERSISTENT_STATE) ?? null
};

export const auth = createAsyncThunk('auth/login',
	async (params: {email: string, username: string, password: string}) => {
		try {
			const { data } = await axios.post<AuthResponse>(`${BACK_PREFIX}/auth/login`, {
				email: params.email,
				username: params.username,
				password: params.password
			});
			return {data: data, email: params.email, username: params.username};
		} catch (e) {
			if (e instanceof AxiosError) {
				throw new Error(e.response?.data.message);
			}
		}
	}
);

//export const register = createAsyncThunk('user/register',
//	async (params: { id42: string, name: string, email:string, password: string }) => {
//		try {
//			const { data } = await axios.post<LoginResponse>(`${PREFIX}/auth/register`, {
//				id42:params.id42,
//				name: params.name,
//				email: params.email,
//				password: params.password
//			});
//			return data;
//		} catch (e) {
//			if (e instanceof AxiosError) {
//				throw new Error(e.response?.data.message);
//			}
//		}
//	}
//);

export const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		logout: (state) => {
			state.email = '';
			state.token = null;
			state.username = '';
			console.log('logout!');
		},
		clearAuthError: (state) => {
			state.authErrorMessage = undefined;
		}
	},
	extraReducers: (builder) => {
		builder.addCase(auth.fulfilled, (state, action) => {
			if (!action.payload) {
				return;
			}
			state.userId = action.payload.data.id;
			state.token = action.payload.data.access_token;
			state.email = action.payload.email;
			state.username = action.payload.username;
		});
		builder.addCase(auth.rejected, (state, action) => {
			state.authErrorMessage = action.error.message;
			console.log(action.error);
		});
		//builder.addCase(register.fulfilled, (state, action) => {
		//	if (!action.payload) {
		//		return;
		//	}
		//	state.id42 = action.payload.id42;
		//});
		//builder.addCase(register.rejected, (state, action) => {
		//	state.registerError = action.error.message;
		//});
	}
});

export default userSlice.reducer;
export const userActions = userSlice.actions;