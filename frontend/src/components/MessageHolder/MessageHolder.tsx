import { FormEvent, forwardRef, useEffect, useState } from 'react';
//import { Chat } from './Chat.props';
import styles from './MessageHolder.module.css';
import Headling from '../../components/Headling/Headling';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { auth, getUserProfile, userActions } from '../../store/user.slice';
import Search from '../../components/Search/Search';
import { channelActions } from '../../store/channels.slice';
import { ChannelList } from './ChannelList/ChannelList';
import ChatWindow from './ChatWindow/ChatWindow';
import { ChannelPreview } from '../../interfaces/channel.interface';
import { INITIAL_CHANNEL } from '../../helpers/ChatInit';
import { MessageHolderProps } from './MessageHolder.props';
import classNames from 'classnames';
import ModalContainer from '../ModalContainer/ModalContainer';
//import {RootState} from '../../store/store'



function MessageHolder({message, appearence = 'self', ...props}: MessageHolderProps) {

	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const onClick = () => {
		//delete message
	};

	return (
		<div className={styles['message-card']}>
			{appearence !== 'self'
				? <>
					<img src={message.owner.avatar
						? message.owner.avatar
						: '/default_avatar.png'} className={styles['avatar']} onClick={() => {
						dispatch(getUserProfile(message.owner.id));
						navigate(`/Chat/channel/${message.cid}/member/${message.owner.id}`);
					}}/>
				</>
				: <></> }
			<div {...props} className={classNames(styles['message'], styles[appearence])}>
				{appearence !== 'self'
					? <Headling className={styles['msg-owner']}>{message.owner.username}
					</Headling>
					: <></>}
				{message.msg}
			</div>
		</div>
	);
}

export default MessageHolder;