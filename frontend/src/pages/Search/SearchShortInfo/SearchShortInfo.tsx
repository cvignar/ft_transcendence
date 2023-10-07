import { useState } from 'react';
import styles from './SearchShortInfo.module.css';
import { SearchShortInfoProps } from './SearchShortInfoProps';
export function SearchShortInfo ({ appearence = 'list', props }: SearchShortInfoProps) {
	const [modlaIsOpen, setIsOpen] = useState<boolean>(false);

	return (
		<div className={styles['info']}>
			<img
				className={styles['avatar']}
				src={props?.picture ? props.picture : '/default_avatar.png'}
				/>

			<div className={styles['header-message']}>
				<div className={styles['header']}>{props?.name}</div>
				{appearence === 'list' ? <div className={styles['message']}>{props?.lastMessage ? props.lastMessage : ''}</div> : ''}
			</div>
		</div>
	);

}