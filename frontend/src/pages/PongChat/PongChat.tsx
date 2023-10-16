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
import { Outlet } from 'react-router-dom';
import { getCookie } from 'typescript-cookie';

export function PongChat() {
	const dispatch = useDispatch<AppDispatch>();
	const {email} = useSelector((s: RootState) => s.user);
	const channelState = useSelector((s: RootState) => s.channel);
	const [isActive, setActive] = useState<number>(-1);

	const [selectedChannel, setSelectedChannel] = useState<ChannelPreview>(INITIAL_CHANNEL);
	
	const [isProtected, setIsProtected] = useState<boolean>(false);

	let subtitle;
	const [modalIsOpen, setIsOpen] = useState(false);

	const openModal = () => {
		setIsOpen(true);
	};

	const afterOpenModal = () => {
		subtitle.style.color = '#f00';
	};

	const closeModal = () => {
		setIsOpen(false);
	};

	const onSubmit = (event: FormEvent) => {};

	useEffect(() => {
		const timerId = setTimeout(() => {
			const token = getCookie('accessToken');
			if (token) {
				dispatch(channelActions.getChannels(email));
			}
		}, 10);
		return () => clearTimeout(timerId);
	}, [dispatch]);

	return (
		<>
			<ChannelList channels={channelState.channels} setChannel={setSelectedChannel} isActive={isActive} setActive={setActive}/>
			<div className={styles['other']}>
				<Outlet/>
			</div>
		</>
	);
}