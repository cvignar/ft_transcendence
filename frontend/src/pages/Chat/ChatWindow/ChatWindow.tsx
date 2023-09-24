import { ChatWindowProps } from './ChatWindow.props';
import styles from './ChatWindow.module.css'; 
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
function ChatWindow({ data }: ChatWindowProps) {
	const dispatch = useDispatch<AppDispatch>();
	const [message, setMessage] = useState<string>('');
	const email = useSelector((s: RootState) => s.user.email);
	const [value, setValue] = useState<string>('');
	const messages: Message[] = useSelector((s: RootState) => s.channel.messages);

	const sendMessage = (event: React.KeyboardEvent) => {
		if (event.key == 'Enter' && /\S/.test(message)) {
			setValue('');
			const newMessage: CreateMessage = {
				message: message,
				email: email,
				channelId: data.id
			};
			dispatch(channelActions.sendMessage(newMessage));
		}
	};

	const onChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
		setValue(event.target.value);
		setMessage(event.target.value);
		console.log(`'${event.target.value}'`);
	};

	useEffect(() => {
		dispatch(channelActions.getMessages(data.id));
	}, [dispatch, data.id]);

	return (
		<div className={styles['window']}>
			<div className={styles['head']}>
				<ChannelShortInfo appearence='chat' props={data}/>
			</div>
			<hr/>
			<div className={styles['chat-area']}>
				<div className={styles['messages']}>
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
					? <div></div>
					: <textarea
						name='messageInput'
						placeholder='Enter your message...'
						className={styles['text-area']}
						onChange={onChange}
						onKeyDown={sendMessage}
						value={value}/>}
				{/*: <Input name="messageInput" placeholder='Enter your message...' className={styles['text-area']} onChange={onChange} onKeyDown={onSendMessage} value={value.messageInput}/>}*/}
			</div>
		</div>
	);
}

export default ChatWindow;
