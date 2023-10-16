import { useDispatch, useSelector } from 'react-redux';
import Button from '../../components/Button/Button';
import Chat from '../Chat/Chat';
import { Pong } from '../Pong/pong';
import styles from './SearchPage.module.css';
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
import Search from '../../components/Search/Search';
import { SearchList } from './SearchList/SearchList';

export function SearchPage() {
	const dispatch = useDispatch<AppDispatch>();
	const channelState = useSelector((s: RootState) => s.channel);
	const [isActive, setActive] = useState<number>(-1);	

	return (
		<>
			<SearchList setChannel={channelActions.setSelectedChannel} isActive={isActive} setActive={setActive}/>
			<div className={styles['other']}>
				<Outlet/>
			</div>
		</>
	);
}