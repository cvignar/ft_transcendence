import { FormEvent, useEffect, useState } from 'react';
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
import { channelActions } from '../../store/channels.slice';
import { ChannelList } from './ChannelList/ChannelList';
import ChatWindow from './ChatWindow/ChatWindow';
import { ChannelPreview } from '../../interfaces/channel.interface';
import { INITIAL_CHANNEL } from '../../helpers/ChatInit';
//import {RootState} from '../../store/store'



export default function Chat() {
	const {email, token} = useSelector((s: RootState) => s.user);
	const dispatch = useDispatch<AppDispatch>();
	const channelState = useSelector((s: RootState) => s.channel);
	//const [channels, setChannels] = useState<ChannelPreview[]>();
	//const channels = useSelector((s: RootState) => s.channel.items);
	const [selectedChannel, setSelectedChannel] = useState<ChannelPreview>(INITIAL_CHANNEL);

	useEffect(() => {
		const timerId = setTimeout(() => {
			if (token) {
				dispatch(channelActions.startConnecting());
			}
		}, 0);
		return () => clearTimeout(timerId);
	}, [dispatch, token]);
	return (
		<div className={styles['page']}>
			<div className={styles['left-panel']}>
				<div className={styles['head']}>
					<Headling>Channels</Headling>
					<Search placeholder='Search'></Search>
				</div>
				<ChannelList channels={channelState.channels} setChannel={setSelectedChannel}/>
			</div>
			<ChatWindow data={selectedChannel}/>
		</div>
	);
}