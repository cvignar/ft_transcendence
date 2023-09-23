import { useDispatch } from 'react-redux';
import Button from '../../components/Button/Button';
import Chat from '../Chat/Chat';
import { Pong } from '../Pong/pong';
import styles from './PongChat.module.css';
import { AppDispatch } from '../../store/store';
import { userActions } from '../../store/user.slice';
import {socket} from '../Pong/pong';

export function PongChat() {
	const dispatch = useDispatch<AppDispatch>();
	//let userName: string = '';

	//setTimeout(() => {userName = 'anka';} );

	//const onSubmit = () => {

	//};

	const logout = () => {
		console.log('logout ?');
		dispatch(userActions.logout());
		socket.close();
		window.location.reload();
	};

	return (
		<div>
			<div className={styles['body']}>
				<div>
					<Pong/>
				</div>
				<div>
					<Chat/>
				</div>
			</div>
			<Button onClick={logout}>Logout</Button>
		</div>
	);
}