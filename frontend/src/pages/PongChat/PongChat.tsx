import { Chat } from '../Chat/Chat';
import { Pong } from '../Pong/pong';
import styles from './PongChat.module.css';

export function PongChat() {
	//let userName: string = '';

	//setTimeout(() => {userName = 'anka';} );

	//const onSubmit = () => {

	//};

	return ( <div className={styles['body']}>
		<div>
			<Pong/>
		</div>
		<div>
			<Chat/>
		</div>
		{/*<div className='pong-div'>
			{userName ? <iframe className='pong' src={`http://localhost:5000/?nickname=${userName}`} title="pong72"/> : <></>}
		</div>
		<div className='chat-div'>
		</div>*/}
	</div>
	);
}