import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { BACK_PREFIX } from '../helpers/API';
import { AuthResponse } from '../interfaces/auth.interface';
//import { Profile } from '../interfaces/user.interface';
import { loadState } from './storage';
//import { RootState } from './store';

export const JWT_PERSISTENT_STATE = 'userToken';
export interface UserPersistantState {
	//id42: string | null;
	//username: string | null;
	token: string | null;
}

export interface UserState {
	token: string | null;
	//id42: string | null;
	authErrorMessage?: string;
	//username?: string | null;
	//profile?: Profile;
	//profileError?: string;
	//registerError?: string;
}


const initialState: UserState = {
	token: loadState<UserPersistantState>(JWT_PERSISTENT_STATE)?.token ?? null
};

export const auth = createAsyncThunk('auth/login',
	async (params: {email: string, username: string, password: string}) => {
		try {
			console.log(params);
			const { data } = await axios.post<AuthResponse>(`${BACK_PREFIX}/auth/login`, {
				email: params.email,
				username: params.username,
				password: params.password
			});
			return data;
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
		//logout: (state) => {
		//	state.token = null;
		//},
		clearAuthError: (state) => {
			state.authErrorMessage = undefined;
		}
		//clearRegisterError: (state) => {
		//	state.registerError = undefined;
		//}

	},
	extraReducers: (builder) => {
		builder.addCase(auth.fulfilled, (state, action) => {
			if (!action.payload) {
				return;
			}
			state.token = action.payload.access_token;
			console.log(action
				.payload);
			console.log(state.token);
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