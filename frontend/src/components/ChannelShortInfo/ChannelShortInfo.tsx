import styles from './ChannelShortInfo.module.css';
import { ChannelShortInfoProps } from './ChannelShortInfoProps';
export function ChannelShortInfo (props: ChannelShortInfoProps) {

	return (
		<div className={styles['info']}>
			<img className={styles['avatar']} src={props.avatar ? props.avatar : '/default_avatar.png'}/>
			<div className={styles['header-message']}>
				<div className={styles['header']}>{props.name}</div>
				{props.appearence === 'list' ? <div className={styles['message']}>{props.name}</div> : <div className={styles['message']}>{props.membersCount} members</div>}
			</div>
		</div>
	);

}