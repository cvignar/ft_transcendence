import { FormEvent, useEffect } from 'react';
//import { Chat } from './Chat.props';
import styles from './Chat.module.css';
import Headling from '../../components/Headling/Headling';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { auth, userActions } from '../../store/user.slice';
import Search from '../../components/Search/Search';

export function Chat() {
	//const navigate = useNavigate();
	//const dispatch = useDispatch<AppDispatch>();
	//const { id42, authErrorMessage } = useSelector((s: RootState) => s.user);

	//useEffect(() => {
	//	if (id42) {
	//		navigate('/PongChat');
	//	}
	//}, [id42, navigate]);

	const submit = async (e: FormEvent) => {
	//	e.preventDefault();
	//	dispatch(userActions.clearAuthError());
	//	const target = e.target as typeof e.target & AuthForm;
	//	const {username, id42, email, hash} = target;
		console.log(username.value, id42.value, email.value, hash.value);
	//	dispatch(auth({ username: username.value, id42: id42.value, email: email.value, hash: hash.value }));
	};


	return (
		<div className={styles['page']}>
			<div className={styles['left-panel']}>
				<Search placeholder='Search'></Search>
				Chatlist Chatlist Chatlist Chatlist Chatlist Chatlist Chatlist Chatlist
			</div>
			<div className={styles['right-panel']}>
				ChatChatChatChatChatChatChatChatChatChatChatChatChat
			</div>
		</div>
	);
}