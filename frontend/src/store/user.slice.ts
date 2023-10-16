import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { BACK_PREFIX } from "../helpers/API";
import { AuthResponse } from "../interfaces/auth.interface";
import { Profile, UpdateUser } from "../interfaces/user.interface";
import { loadState } from "./storage";
import { store } from "./store";
import { getCookie, setCookie} from "typescript-cookie";
import { Status } from '../helpers/enums';
//import { RootState } from './store';

axios.defaults.withCredentials = true;
export const JWT_PERSISTENT_STATE = "userToken";
export const EMAIL_PERSISTENT_STATE = "userEmail";
export const USERNAME_PERSISTENT_STATE = "userName";
export const USERID_PERSISTENT_STATE = "userId";
export const PROFILE_PERSISTENT_STATE = 'userProfile';
export const LEADERBOARD_PRSISTENT_STATE = 'leaderboard';
const back_prefix = `https://${import.meta.env.VITE_BACK_HOST}:${import.meta.env.VITE_BACK_PORT}`;
const uri = `${back_prefix}/auth/intra42`;
const uri2fa = `${back_prefix}/auth/2fa`;
const uriEnable2fa = `${back_prefix}/user/enable2fa`;
const uriDisable2fa = `${back_prefix}/user/disable2fa`;
const uriLogout = `${back_prefix}/auth/logout`;

export enum UserEvents {
	updateProfile = 'update profile',
	addFriend = 'add friend',
	removeFriend = 'remove friend',
	blockUser = 'block user',
	unblockUser = 'unblock user',
	getGameHistory = 'get gameHistory',
	getFriends = 'get friends',
	getLeaderboard = 'get leaderboard',
}
export interface UserState {
	token: string | null;
	email?: string;
	authErrorMessage?: string;
	username?: string;
	userId: number | null;
	profile: Profile | null;
	profileError?: string;
	selectedUser: Profile | null;
	statuses: any;
	selectedGameHistory: any;
	qrUri: string | undefined;
	friends: any[];
	leaderboard: any[];
}

const initialState: UserState = {
	token: loadState<string>(JWT_PERSISTENT_STATE) ?? null,
	email: loadState<string>(EMAIL_PERSISTENT_STATE) ?? '',
	username: loadState<string>(USERNAME_PERSISTENT_STATE) ?? '',
	userId: loadState<number | null>(USERID_PERSISTENT_STATE) ?? null,
	profile: loadState<Profile>(PROFILE_PERSISTENT_STATE) ?? null,
	selectedUser: loadState<Profile>('selectedUser') ?? null,
	statuses: loadState<any>('statuses') ?? null,
	selectedGameHistory: [],
	qrUri: '',
	friends: [],
	leaderboard: loadState<any>(LEADERBOARD_PRSISTENT_STATE) ?? [],
};

export const auth = createAsyncThunk("auth/login", async () => {
	try {
		const { data } = await axios.get<AuthResponse>(`${uri}`);
		return { data: data };
	} catch (e) {
		if (e instanceof AxiosError) {
			throw new Error(e.response?.data.message);
		}
	}
});

export const logoutAPI = createAsyncThunk("auth/logout", async (userId: number) => {
	try {
		const { data } = await axios.post<any>(`${uriLogout}`, {
			userId: userId
		});
		return { data: data };
	} catch (e) {
		if (e instanceof AxiosError) {
			throw new Error(e.response?.data.message);
		}
	}
});

export const auth2fa = createAsyncThunk("auth/2fa", async (params: {code: string | null}) => {
	try {
		const { data } = await axios.post<any>(`${uri2fa}`, params);
		return { data: data };
	} catch (e) {
		if (e instanceof AxiosError) {
			throw new Error(e.response?.data.message);
		}
	}
});

export const enable2fa = createAsyncThunk("user/enable2fa", async () => {
	try {
		const { data } = await axios.get<any>(`${uriEnable2fa}`);
		return { data: data };
	} catch (e) {
		if (e instanceof AxiosError) {
			throw new Error(e.response?.data.message);
		}
	}
});

export const disable2fa = createAsyncThunk("user/disable2fa", async () => {
	try {
		const { data } = await axios.get<any>(`${uriDisable2fa}`);
		return { data: data };
	} catch (e) {
		if (e instanceof AxiosError) {
			throw new Error(e.response?.data.message);
		}
	}
});

export const getProfile = createAsyncThunk("/getProfile", async (id: number | null) => {
	try {
		const { data } = await axios.get<any>(`${BACK_PREFIX}/user/getProfile/${getCookie('userId')}`, {
			headers: { Authorization: `Bearer ${getCookie("accessToken")}` },
		});
		return { profile: data };
	} catch (e) {
		if (e instanceof AxiosError) {
			throw new Error(e.response?.data.message);
		}
	}
});

export const getUserProfile = createAsyncThunk("/getUserProfile", async (id: number | null) => {
	try {
		const { data } = await axios.get<any>(`${BACK_PREFIX}/user/getProfile/${id}`, {
			headers: { Authorization: `Bearer ${getCookie("accessToken")}` },
		});
		return { profile: data };
	} catch (e) {
		if (e instanceof AxiosError) {
			throw new Error(e.response?.data.message);
		}
	}
});

export const updateProfile = createAsyncThunk("/updateProfile", async (params: UpdateUser) => {
	try {
		const { data } = await axios.post<any>(`${BACK_PREFIX}/user/updateProfile/${params.id}`, params);
		return data;
	} catch (e) {
		if (e instanceof AxiosError) {
			throw new Error(e.response?.data.message);
		}
	}
});

export const uploadAvatar = createAsyncThunk("/uploadAvatar", async (img_data: FormData) => {
	try {
		const { data } = await axios.post<any>(`${BACK_PREFIX}/user/uploadAvatar/${getCookie('userId')}`, img_data, {
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

export const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		logout: (state) => {
			setCookie('accessToken', '');
			setCookie('userId', '');
			state.email = '';
			state.token = null;
			state.username = null;
			state.profile = null;
			state.authErrorMessage = null;
			state.userId = null;
			state.profileError = null;
			state.selectedUser = null;
			state.statuses = null;
			state.selectedGameHistory = null;
			state.qrUri = undefined;
			state.friends = [];
			state.leaderboard = [];
		},
		clearAuthError: (state) => {
			state.authErrorMessage = undefined;
		},
		setUser: (state, action: PayloadAction<any>) => {
			state.email = action.payload.email;
			state.userId = action.payload.userId;
		},
		setStatuses: (state, action: PayloadAction<any>) => {
			state.statuses = action.payload;
		},
		setProfile: (state, action: PayloadAction<UpdateUser>) => {
			if (state.profile && action.payload) {
				state.profile.username = action.payload.username ?? state.profile?.username;
				state.profile.avatar = action.payload.avatar ?? state.profile?.avatar;
				state.profile.prefferedTableSide = action.payload.prefferedTableSide ?? state.profile?.prefferedTableSide;
				state.profile.pongColorScheme = action.payload.pongColorScheme ?? state.profile?.pongColorScheme;
			}
		},
		addFriend: (state, action: PayloadAction<{ selfId: number; friendId: number }>) => {
			return;
		},
		updateProfile: (state, action: PayloadAction<Profile>) => {
			if (action.payload) {
				state.profile = action.payload;
			}
		},
		removeFriend: (state, action: PayloadAction<{ selfId: number; friendId: number }>) => {
			return;
		},
		blockUser: (state, action: PayloadAction<{ selfId: number; friendId: number }>) => {
			return;
		},
		unblockUser: (state, action: PayloadAction<{ selfId: number; friendId: number }>) => {
			return;
		},
		getGameHistory: (state, action: PayloadAction<number>) => {
			return;
		},
		setGameHistory: (state, action: PayloadAction<any>) => {
			state.selectedGameHistory = action.payload;
		},
		getFriends: (state, action: PayloadAction<number>) => {
			return;
		},
		setFriends: (state, action: PayloadAction<any[]>) => {
			state.friends = action.payload;
		},
		getLeaderboard: (state) => {
			return;
		},
		setLeaderboard: (state, action: PayloadAction<any[]>) => {
			state.leaderboard = action.payload;
		},
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
		builder.addCase(auth2fa.rejected, (state, action) => {
			console.log('return went wrong in 2fa');
		});
		builder.addCase(auth2fa.fulfilled, (state, action) => {
			console.log('return in 2fa fullfilled');
			if (action.payload.data) console.log(action.payload.data);
		});
		builder.addCase(getProfile.fulfilled, (state, action) => {
			console.log('fulfiled!', action.payload);
			if (!action.payload) {
				return;
			}
			state.profile = action.payload.profile;
			console.log(state.profile);
		});
		builder.addCase(getProfile.rejected, (state, action) => {
			state.authErrorMessage = action.error.message;
			console.log(action.error);
		});
		builder.addCase(updateProfile.fulfilled, (state, action) => {
			if (!action.payload) {
				return;
			}
			state.profile = action.payload;
		});
		builder.addCase(updateProfile.rejected, (state, action) => {
			state.profileError = action.error.message;
			console.log(action.error);
		});
		builder.addCase(getUserProfile.fulfilled, (state, action) => {
			if (!action.payload) {
				return;
			}
			state.selectedUser = action.payload.profile;
		});
		builder.addCase(getUserProfile.rejected, (state, action) => {
			state.profileError = action.error.message;
			console.log(action.error);
		});
		builder.addCase(enable2fa.rejected, (state, action) => {
			state.profileError = action.error.message;
			console.log(action.error);
		});
		builder.addCase(enable2fa.fulfilled, (state, action) => {
			state.qrUri = action.payload?.data;
			console.log(action.payload);
		});
		builder.addCase(disable2fa.rejected, (state, action) => {
			state.profileError = action.error.message;
			console.log(action.error);
		});
		builder.addCase(disable2fa.fulfilled, (state, action) => {
			state.qrUri = '';
			console.log(action.payload);
		});
		builder.addCase(uploadAvatar.fulfilled, (state, action) => {
			console.log(`RETURN DATA: ${action.payload}`);
			if (!action.payload) {
				return;
			}
		});
		builder.addCase(uploadAvatar.rejected, (state, action) => {
			state.profileError = action.error.message;
			console.log(action.error);
		});
		builder.addCase(logoutAPI.fulfilled, (state, action) => {
			return ;
		});
		builder.addCase(logoutAPI.rejected, (state, action) => {
			return ;
		});
	},
});

export default userSlice.reducer;
export const userActions = userSlice.actions;
