import classNames from 'classnames';
import styles from './LeaderboardItem.module.css';
import { leaderboardItemProps } from './LeaderboardItem.props';
import Headling from '../../../components/Headling/Headling';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { Status } from '../../../helpers/enums';

export function LeaderboardItem({data, appearence = 'leaderboard'}: leaderboardItemProps) {
	const statuses = useSelector((s: RootState) => s.user.statuses);

	const getStatus = (userId: number) => {
		for (const status of statuses) {
			if (userId === status[0]) {
				return status[1];
			}
		}
	};

	return (
		<div className={styles['card']}>
			<div className={styles['row']}>
				<div className={styles['face']}>
					<img className={styles['avatar']} src={data.avatar ? data.avatar : '/default_avatar.png'}/>
				</div>
				<div className={styles['col']}>
					{appearence === 'leaderboard' && <div>Rank {data.rank}</div>}
					{appearence === 'leaderboard' && <div>Games {data.gamesPlayed}</div>}
				</div>
				<div className={classNames(styles['col'], styles['col-right'])}>
					<div className={classNames(
						getStatus(data.id) !== Status.offline && styles['online'])}>
						{getStatus(data.id) === Status.playing ? 'online' : getStatus(data.id)}
					</div>
					{getStatus(data.id) === Status.playing && <div className={styles['online']}>{getStatus(data.id)}</div>}
				</div>
			</div>
			<div className={styles['row']}>
				<Headling className={styles['header']}>{data.username}</Headling>
			</div>
		</div>
	);
}