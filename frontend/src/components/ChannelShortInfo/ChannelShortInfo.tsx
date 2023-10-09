import { useState } from 'react';
import { ChannelPreview } from '../../interfaces/channel.interface';
import ModalContainer from '../ModalContainer/ModalContainer';
import styles from './ChannelShortInfo.module.css';
import { ChannelShortInfoProps } from './ChannelShortInfoProps';
export function ChannelShortInfo ({ appearence = 'list', props }: ChannelShortInfoProps) {
	const [modlaIsOpen, setIsOpen] = useState<boolean>(false);
	const chooseDefaultPicture = () => {
		if (props && props.type) {
			if (props.type === 'public') {
				return '/default_channel_public.png';
			} else if (props.type === 'private') {
				return '/default_channel_private.png';
			} else if (props.type === 'protected') {
				return '/default_channel_protected.png';
			} else {
				return '/default_avatar.png';
			}
		} else if (props) {
			return '/default_avatar.png';
		}
	}
	return (
		<div className={styles['info']}>
			<img
				className={styles['avatar']}
				src={props?.picture ? props.picture : (props.avatar ? props.avatar : chooseDefaultPicture())}
				onClick={appearence !== 'list'
					? () => setIsOpen(true)
					: () => {}}/>
			<ModalContainer modalIsOpen={modlaIsOpen} setIsOpen={setIsOpen}><div>Some channel</div></ModalContainer>

			<div className={styles['header-message']}>
				<div className={styles['header']}>{props?.name ? props.name : (props.username ? props.username : '')}</div>
				{appearence === 'list' ? <div className={styles['message']}>{props?.lastMessage ? props.lastMessage : ''}</div> : ''}
			</div>
		</div>
	);

}