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
import { RequireAuth } from './helpers/RequireAuth';

const Chat = lazy(() => import('./pages/Chat/Chat'));
const router = createBrowserRouter([
	{ // FIXME!!!! FAKE AUTH
		path: '/',
		element: <AuthForm/>
	},
	{
		path: '/Chat',
		element: <RequireAuth><Chat/></RequireAuth>
	},
	//{
	//	path: '/',
	//	element: <Chat/>
	//},
	{
		path: '/PongChat',
		element: <PongChat/>
	}
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
	//<React.StrictMode>
	<Provider store={store}>
		<RouterProvider router={router}/>
	</Provider>

	//</React.StrictMode>
);
