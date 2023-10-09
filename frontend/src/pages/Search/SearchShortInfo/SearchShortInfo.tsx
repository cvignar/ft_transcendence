import { useState } from 'react';
import styles from './SearchShortInfo.module.css';
import { SearchShortInfoProps } from './SearchShortInfoProps';
export function SearchShortInfo ({ appearence = 'list', props }: SearchShortInfoProps) {
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
				src={props?.picture ? props.picture :chooseDefaultPicture()}
				/>

			<div className={styles['header-message']}>
				<div className={styles['header']}>{props?.name}</div>
				{appearence === 'list' ? <div className={styles['message']}>{props?.tag ? props.tag : ''}</div> : ''}
			</div>
		</div>
	);

}