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
import { SelfStats } from './pages/Settings/SelfStats/SeldStats';
import { GoToSettings } from './helpers/GoToSettings';
import { Info } from './pages/Info/Info';

const router = createBrowserRouter([
	{
		path: '/Auth',
		element: <AuthForm/>,
	},
	{
		path: '/Auth/2FA',
		element: <Auth2FaForm/>,
	},
	{
		path: '/',
		element: <RequireAuth><Layout/></RequireAuth>,
		children: [
			{
				path: '/Chat',
				element: <RequireAuth><PongChat/></RequireAuth>,
				children: [
					{
						path: '/Chat/channel/:channelId',
						element: <RequireAuth><ChatWindow/></RequireAuth>
					},
					{
						path: '/Chat/channel/:channelId/member/:userId',
						element: <RequireAuth><MemberPreview/></RequireAuth>
					},
					{
						path: '/Chat/createChannel',
						element:  <RequireAuth><CreateChannelFrom/></RequireAuth>
					},
					{
						path: '/Chat/channel/:channelId/settings',
						element: <RequireAuth><ChannelSettings/></RequireAuth>
					},
					{
						path: '/Chat/channel/:channelId/adminSettings',
						element: <RequireAuth><ChannelSettings/></RequireAuth>
					}
				]
			},
			{
				path: '/Search',
				element: <RequireAuth><SearchPage/></RequireAuth>,
				children: [
					{
						path: '/Search/user/:userId',
						element: <RequireAuth><MemberPreview/></RequireAuth>
					},
					{
						path: '/Search/channel/:channelId',
						element: <RequireAuth><ChannelSettings/></RequireAuth>
					}
				]
			},
			{
				path: '/Settings',
				element: <RequireAuth><Settings/></RequireAuth>,
				children: [
					{
						path: '/Settings/Stats',
						element: <RequireAuth><SelfStats/></RequireAuth>
					},
					{
						path: '/Settings/friend/:userId',
						element: <RequireAuth><MemberPreview/></RequireAuth>
					}
				]
			},
			{
				path: '/Leaderboard',
				element: <RequireAuth><Leaderboard/></RequireAuth>,
				children: [
					{
						path: '/Leaderboard/user/:userId',
						element:  <RequireAuth><MemberPreview/></RequireAuth>
					}
				]
			},
			{
				path: '/Info',
				element: <RequireAuth><Info/></RequireAuth>
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
