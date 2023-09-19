import { ChatWindowProps } from './ChatWindow.props';
import styles from './ChatWindow.module.css'; 
import Headling from '../../../components/Headling/Headling';
import { ChannelShortInfo } from '../../../components/ChannelShortInfo/ChannelShortInfo';
import Input from '../../../components/Input/Input';
import { useState } from 'react';
import { CreateMessage } from '../../../interfaces/createMessage.interface';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
function ChatWindow({ data }: ChatWindowProps) {
	const [message, setMessage] = useState<string>('');
	const email = useSelector((s: RootState) => s.user.email);

	return (
		<div className={styles['window']}>
			<div className={styles['head']}>
				<ChannelShortInfo appearence='chat' props={data}/>
			</div>
			<div className={styles['chat-area']}>
				<div className={styles['messages']}>
				</div>
				{/*{data.id === -1 ? <></> : <Input className={styles['text-area']} placeholder='Enter your message...' onChange={(e) => {
					setMessage(e.target.value);
				}} onKeyDown={(event) => {
					if (event.key == 'Enter') {
						const newMessage: CreateMessage = {
							message: message,
							email: email,
							channelId: data.id
						};
						console.log(newMessage);
						socket.emit('new message', newMessage);
						console.log(`Send message: ${message}`);
					}
				}}/>}*/}
			</div>
		</div>
	);
}

export default ChatWindow;
