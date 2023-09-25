import styles from './Settings.module.css';
import layoutStyles from '../Layout/Layout.module.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

export function Settings() {

	const user = useSelector((s: RootState) => s.user);

	return (
		<div className={layoutStyles['outlet']}>
			<img className={styles['avatar']} src={'/default_avatar.png'}/>
			<div>{user.username}</div>
		</div>
	);
}