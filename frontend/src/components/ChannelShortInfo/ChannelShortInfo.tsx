import { ChannelPreview } from '../../interfaces/channel.interface';
import styles from './ChannelShortInfo.module.css';
import { ChannelShortInfoProps } from './ChannelShortInfoProps';
export function ChannelShortInfo ({ appearence = 'list', props }: ChannelShortInfoProps) {

	return (
		<div className={styles['info']}>
			<img className={styles['avatar']} src={props?.picture ? props.picture : '/default_avatar.png'}/>
			<div className={styles['header-message']}>
				<div className={styles['header']}>{props?.name}</div>
				{appearence === 'list' ? <div className={styles['message']}>{props?.lastMessage ? props.lastMessage : 'Empty chat'}</div> : ''}
			</div>
		</div>
	);

}