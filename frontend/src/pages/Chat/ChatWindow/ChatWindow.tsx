import { ChatWindowProps } from './ChatWindow.props';
import styles from './ChatWindow.module.css'; 
import Headling from '../../../components/Headling/Headling';
import { ChannelShortInfo } from '../../../components/ChannelShortInfo/ChannelShortInfo';
import Input from '../../../components/Input/Input';
import { useEffect, useRef, useState } from 'react';
import { CreateMessage } from '../../../interfaces/createMessage.interface';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { channelActions } from '../../../store/channels.slice';
import MessageHolder from '../../../components/MessageHolder/MessageHolder';
import { Message } from '../../../interfaces/message.interface';
function ChatWindow({ data }: ChatWindowProps) {
	const dispatch = useDispatch<AppDispatch>();
	const [message, setMessage] = useState<string>('');
	const email = useSelector((s: RootState) => s.user.email);
	const [value, setValue] = useState<{messageInput: string}>({messageInput: ''});
	const messages: Message[] = useSelector((s: RootState) => s.channel.messages);

	const div = useRef(null);

	const onSendMessage = (event: React.KeyboardEvent) => {
		if (event.key == 'Enter' && message != '') {
			const newMessage: CreateMessage = {
				message: message,
				email: email,
				channelId: data.id
			};
			console.log(newMessage);
			setValue({messageInput: ''});
			dispatch(channelActions.sendMessage(newMessage));
		}
	};

	const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValue({messageInput: event.target.value});
		setMessage(event.target.value);
	};

	useEffect(() => {
		console.log(data.id);
		dispatch(channelActions.getMessages(data.id));
	}, [dispatch, data.id]);

	useEffect(() => {
		console.log(messages);
	}, [messages]);

	useEffect(() => {
		div.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
	}, []);
	return (
		<div className={styles['window']}>
			<div className={styles['head']}>
				<ChannelShortInfo appearence='chat' props={data}/>
			</div>
			<div className={styles['chat-area']}>
				<div className={styles['messages']} ref={div}>
					{messages?.map(message => (
						<MessageHolder
							key={message.id}
							appearence={message.owner.email == email
								? 'self'
								: 'other'}
							message={message}/>
					))}
				</div>
				{data.id === -1
					? <></>
					: <Input name="messageInput" placeholder='Enter your message...' className={styles['text-area']} onChange={onChange} onKeyDown={onSendMessage} value={value.messageInput}/>}
			</div>
		</div>
	);
}

export default ChatWindow;
