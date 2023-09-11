import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { BACK_PREFIX } from '../helpers/API';
import { AuthResponse } from '../interfaces/auth.interface';
//import { Profile } from '../interfaces/user.interface';
import { loadState } from './storage';
//import { RootState } from './store';

export const ID42_PERSISTENT_STATE = 'userData';
export interface UserPersistantState {
	id42: string | null;
	username: string | null;
}

export interface UserState {
	id42: string | null;
	authErrorMessage?: string;
	username?: string | null;
	//profile?: Profile;
	//profileError?: string;
	//registerError?: string;
}


const initialState: UserState = {
	id42: loadState<UserPersistantState>(ID42_PERSISTENT_STATE)?.id42 ?? null
};

export const auth = createAsyncThunk('user/create',
	async (params: {username: string, id42: string, email: string, hash: string}) => {
		try {
			console.log(params);
			const { data } = await axios.post<AuthResponse>(`${BACK_PREFIX}/user/create`, {
				username: params.username,
				id42: params.id42,
				email: params.email,
				hash: params.hash
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
		logout: (state) => {
			state.id42 = null;
		},
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
			state.id42 = action.payload.id42;
		});
		builder.addCase(auth.rejected, (state, action) => {
			state.authErrorMessage = action.error.message;
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