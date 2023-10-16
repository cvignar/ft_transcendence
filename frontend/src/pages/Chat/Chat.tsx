import { FormEvent, useEffect, useState } from 'react';
//import { Chat } from './Chat.props';
import styles from './Chat.module.css';
import Headling from '../../components/Headling/Headling';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { auth, userActions } from '../../store/user.slice';
import Search from '../../components/Search/Search';
import { channelActions } from '../../store/channels.slice';
import { ChannelList } from './ChannelList/ChannelList';
import ChatWindow from './ChatWindow/ChatWindow';
import { ChannelPreview } from '../../interfaces/channel.interface';
import { INITIAL_CHANNEL } from '../../helpers/ChatInit';
//import {RootState} from '../../store/store'
import Modal from 'react-modal';
import CardButton from '../../components/CardButton/CardButton';

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


Modal.setAppElement('#root');

export default function Chat() {
	const {email, token} = useSelector((s: RootState) => s.user);
	const dispatch = useDispatch<AppDispatch>();
	const channelState = useSelector((s: RootState) => s.channel);
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
		subtitle.style.color = '#f00';
	};

	const closeModal = () => {
		setIsOpen(false);
	};

	const onSubmit = (event: FormEvent) => {};

	const onChange = (e: FormEvent) => {
		if (e.target.name === 'type') {
			if (e.target.value === 'protected') {
				setIsProtected(true);
			} else {
				setIsProtected(false);
			}
		}
	};
	return (
		<div className={styles['page']}>
			<div className={styles['left-panel']}>
				<div className={styles['head']}>
					<Headling>Channels</Headling>
					<div className={styles['control-row']}>
						<Search placeholder='Search'></Search>
						<button className={styles['add-channel']} onClick={openModal}>
							<img className={styles['svg']} src='/increase.svg' alt='add channel'/>
						</button>
						<Modal
							isOpen={modalIsOpen}
							onAfterOpen={afterOpenModal}
							onRequestClose={closeModal}
							style={customStyles}
							contentLabel="Example Modal"
						>
							<h2 className={styles['red']}>New channel</h2>
							<button className={styles['remove-button']} onClick={closeModal}>
								<img className={styles['remove-svg']} src='/remove.svg' alt='Remove all'/>
							</button>
							<form onChange={onChange} onSubmit={onSubmit}>
								<Input name="name" placeholder='Name' className={styles['settings-input']}/>
								<fieldset>
									<legend>Type of your channel:</legend>
									<div>
										<input type="radio" id="public" name="type" value="public" defaultChecked />
										<label htmlFor="public">public</label>

										<input type="radio" id="private" name="type" value="private" />
										<label htmlFor="private">private</label>

										<input type="radio" id="protected" name="type" value="protected" />
										<label htmlFor="protected">protected</label>
									</div>
								</fieldset>
								{isProtected && <Input type='password' placeholder='Password' className={styles['settings-input']}/>}
								<Button>Create</Button>
							</form>
						</Modal>
					</div>
				</div>
				<ChannelList channels={channelState.channels} setChannel={setSelectedChannel}/>
			</div>
			<ChatWindow data={selectedChannel}/>
		</div>
	);
}