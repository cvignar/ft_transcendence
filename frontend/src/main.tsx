import React, { lazy } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
//import { AuthForm } from './pages/Auth/Auth';
import { store } from './store/store';
import { Provider } from 'react-redux';
import { PongChat } from './pages/PongChat/PongChat';
//import { Chat } from './pages/Chat/Chat';
import { Pong } from './pages/Pong/pong';
import { AuthForm } from './pages/Auth/Auth';
import { Auth2FaForm } from './pages/Auth/Auth2FA';
import { RequireAuth } from './helpers/RequireAuth';
import { Layout } from './pages/Layout/Layout';
import Chat from './pages/Chat/Chat';
import { Settings } from './pages/Settings/Settings';
import { InvitePartner } from './pages/InvitePartner/InvitePartner';
import { Leaderboard } from './pages/Leaderboard/Leaderboard';
import ChatWindow from './pages/Chat/ChatWindow/ChatWindow';
import MemberPreview from './pages/MemberPreview/MemberPreview';
import { CreateChannelFrom } from './pages/CreateChannelForm/CreateChannelForm';
import { SearchPage } from './pages/Search/SearchPage';
import ChannelSettings from './pages/ChannelSettings/ChannelSettings';

const router = createBrowserRouter([
	{
		path: '/Auth',
		element: <AuthForm></AuthForm>,
	},
	{
		path: '/Auth/2FA',
		element: <Auth2FaForm></Auth2FaForm>,
	},
	{ // FIXME!!!! FAKE AUTH
		path: '/',
		element: <RequireAuth><Layout/></RequireAuth>,
		children: [
			{
				path: '/Chat',
				element: <RequireAuth><PongChat/></RequireAuth>,
				children: [
					{
						path: '/Chat/channel/:channelId',
						element: <ChatWindow/>
					},
					{
						path: '/Chat/channel/:channelId/member/:memberId',
						element: <MemberPreview/>
					},
					{
						path: '/Chat/createChannel',
						element: <CreateChannelFrom/>
					}
				]
			},
			{
				path: '/Search',
				element: <SearchPage/>,
				children: [
					{
						path: '/Search/user/:userId',
						element: <MemberPreview/>
					},
					{
						path: '/Search/channel/:channelId',
						element: <ChannelSettings/>
					}
				]
			},
			{
				path: '/Settings',
				element: <RequireAuth><Settings/></RequireAuth>
			},
			{
				path: '/InvitePartner',
				element: <RequireAuth><InvitePartner/></RequireAuth>
			},
			{
				path: '/Leaderboard',
				element: <RequireAuth><Leaderboard/></RequireAuth>
			}
		]
	}
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
	//<React.StrictMode>
	<Provider store={store}>
		<RouterProvider router={router}/>
	</Provider>
	//</React.StrictMode>
);
