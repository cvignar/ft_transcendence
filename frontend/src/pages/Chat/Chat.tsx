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
import { getChannels } from '../../store/channel.slice';
import { ChannelList } from './ChannelList/ChannelList';

export function Chat() {
	const dispatch = useDispatch<AppDispatch>();
	const channels = useSelector((s: RootState) => s.channel.items);

	useEffect(() => {
		dispatch(getChannels());
	}, []);


	return (
		<div className={styles['page']}>
			<div className={styles['left-panel']}>
				<Search placeholder='Search'></Search>
				<ChannelList channels={channels}/>
			</div>
			<div className={styles['right-panel']}>
				ChatChatChatChatChatChatChatChatChatChatChatChatChat
			</div>
		</div>
	);
}