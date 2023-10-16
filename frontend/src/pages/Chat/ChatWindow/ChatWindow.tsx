import { ChatWindowProps } from './ChatWindow.props';
import styles from './ChatWindow.module.css';
import layoutStyles from '../../Layout/Layout.module.css';
import Headling from '../../../components/Headling/Headling';
import { ChannelShortInfo } from '../../../components/ChannelShortInfo/ChannelShortInfo';
import Input from '../../../components/Input/Input';
import { ChangeEvent, createRef, useEffect, useRef, useState } from 'react';
import { CreateMessage } from '../../../interfaces/createMessage.interface';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { channelActions } from '../../../store/channels.slice';
import MessageHolder from '../../../components/MessageHolder/MessageHolder';
import { Message } from '../../../interfaces/message.interface';
import Modal from 'react-modal';
import Button from '../../../components/Button/Button';
import { MembersList } from '../../Members/MembersList/MembersList';
import ModalContainer from '../../../components/ModalContainer/ModalContainer';
import { useParams } from 'react-router-dom';

const customStyles = {
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		transform: 'translate(-50%, -50%)',
		background: 'var(--white-color)'
	}
};

function ChatWindow() {

	const { channelId } = useParams();
	const dispatch = useDispatch<AppDispatch>();
	const [message, setMessage] = useState<string>('');
	const email = useSelector((s: RootState) => s.user.email);
	const [value, setValue] = useState<string>('');
	const channel = useSelector((s: RootState) => s.channel);

	const sendMessage = (event: React.KeyboardEvent) => {
		if (event.key == 'Enter' && /\S/.test(message)) {
			setValue('');
			const newMessage: CreateMessage = {
				message: message,
				email: email,
				channelId: channel.selectedChannel?.id
			};
			dispatch(channelActions.sendMessage(newMessage));
		}
	};

	const onChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		setValue(event.target.value);
		setMessage(event.target.value);
	};

	useEffect(() => {
		if (channelId) {
			dispatch(channelActions.getSelectedChannel(Number(channelId)));
			dispatch(channelActions.getMessages(Number(channelId)));
		}
	}, [channelId]);

	return (
		<div className={styles['window']}>
			<div className={styles['head']}>
				<ChannelShortInfo appearence='chat' props={channel.selectedChannel}/>
			</div>
			<hr/>
			<div className={styles['chat-area']}>
				<div className={styles['rotate']}>
					{channel.messages?.map(message => (
						<MessageHolder
							key={message.id}
							appearence={message.owner.email == email
								? 'self'
								: 'other'}
							message={message}/>
					))}
				</div>
			</div>
			{channel.selectedChannel?.id === -1
				? <div></div>
				: <textarea
					name='messageInput'
					placeholder='Enter your message...'
					className={styles['text-area']}
					onChange={onChange}
					onKeyDown={sendMessage}
					value={value}/>}
		</div>
	);
}

export default ChatWindow;
