import { useDispatch, useSelector } from 'react-redux';
import Button from '../../components/Button/Button';
import Chat from '../Chat/Chat';
import { Pong } from '../Pong/pong';
import styles from './PongChat.module.css';
import { AppDispatch, RootState } from '../../store/store';
import { userActions } from '../../store/user.slice';
import {socket} from '../Pong/pong';
import { ChannelPreview } from '../../interfaces/channel.interface';
import { INITIAL_CHANNEL } from '../../helpers/ChatInit';
import { FormEvent, useEffect, useState } from 'react';
import { ChannelList } from '../Chat/ChannelList/ChannelList';
import ChatWindow from '../Chat/ChatWindow/ChatWindow';
import { channelActions } from '../../store/channels.slice';

export function PongChat() {
	const dispatch = useDispatch<AppDispatch>();
	const {email, token} = useSelector((s: RootState) => s.user);
	const channelState = useSelector((s: RootState) => s.channel);
	const [isActive, setActive] = useState<number>(-1);
	//const [channels, setChannels] = useState<ChannelPreview[]>();
	//const channels = useSelector((s: RootState) => s.channel.items);

	const [selectedChannel, setSelectedChannel] = useState<ChannelPreview>(INITIAL_CHANNEL);
	
	const [isProtected, setIsProtected] = useState<boolean>(false);

	let subtitle;
	const [modalIsOpen, setIsOpen] = useState(false);

	const openModal = () => {
		setIsOpen(true);
	};

	const afterOpenModal = () => {
		// references are now sync'd and can be accessed.
		subtitle.style.color = '#f00';
	};

	const closeModal = () => {
		setIsOpen(false);
	};

	const onSubmit = (event: FormEvent) => {};

	useEffect(() => {
		const timerId = setTimeout(() => {
			if (token) {
				dispatch(channelActions.startConnecting());
			}
		}, 0);
		return () => clearTimeout(timerId);
	}, [dispatch, token]);

	const onChange = (e: FormEvent) => { //FIXME!
		if (e.target.name === 'type') {
			if (e.target.value === 'protected') {
				setIsProtected(true);
			} else {
				setIsProtected(false);
			}
		}
	};


	const logout = () => {
		console.log('logout ?');
		dispatch(userActions.logout());
		socket.close();
		window.location.reload();
	};

	return (
		//<div className={styles['chat']}>
		<>
			<ChannelList channels={channelState.channels} setChannel={setSelectedChannel} isActive={isActive} setActive={setActive}/>
			<ChatWindow data={selectedChannel}/>
		</>
		//</div>
	);
}