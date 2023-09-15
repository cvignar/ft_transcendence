import { ChatWindowProps } from './ChatWindow.props';
import styles from './ChatWindow.module.css'; 
import Headling from '../../../components/Headling/Headling';
import { ChannelShortInfo } from '../../../components/ChannelShortInfo/ChannelShortInfo';
import Input from '../../../components/Input/Input';
function ChatWindow({ data }: ChatWindowProps) {




	return (
		<div className={styles['window']}>
			<div className={styles['head']}>
				<ChannelShortInfo appearence='chat' avatar='/default_avatar.png' name={data?.name} membersCount={2}/>
			</div>
			<div className={styles['chat-area']}>
				<div className={styles['messages']}>
				</div>
				<Input className={styles['text-area']}/>
			</div>
		</div>
	);
}

export default ChatWindow;
