import { GameHistoryProps } from './GameHistoryItem.props';
import styles from './GameHistoryItem.module.css';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import stylesParent from '../MemberPreview.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { channelActions } from '../../../store/channels.slice';
import { getUserProfile } from '../../../store/user.slice';

function GameHistoryItem({data}: GameHistoryProps) {
	const { selectedUser } = useSelector((s: RootState) => s.user);
	const dispatch = useDispatch<AppDispatch>();

	return (
		<div className={styles['row']}>
			<div className={styles['col']}>{new Date(data.date).toLocaleString()}</div>

			{data.playerId1 !== selectedUser?.id
				? <NavLink
					to={`/Search/user/${data.playerId1}`}
					className={classNames(stylesParent['mail-link'], styles['col'])}
					onClick={() => {
						dispatch(getUserProfile(data.playerId1));
					}}>{data.player1}</NavLink>
				: <div className={styles['col']}>{data.player1}</div>
			}
			{data.playerId2 !== selectedUser?.id
				? <NavLink
					to={`/Search/user/${data.playerId2}`}
					className={classNames(stylesParent['mail-link'], styles['col'])}
					onClick={() => {
						dispatch(getUserProfile(data.playerId2));
					}}>{data.player2}</NavLink>
				: <div className={styles['col']}>{data.player2}</div>
			}
			<div className={styles['col']}>{data.score1}:{data.score2}</div>
		</div>
	);
}

export default GameHistoryItem;