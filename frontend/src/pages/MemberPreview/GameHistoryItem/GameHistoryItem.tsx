import { GameHistoryProps } from './GameHistoryItem.props';
import styles from './GameHistoryItem.module.css';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import classNames from 'classnames';
import stylesParent from '../MemberPreview.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { channelActions } from '../../../store/channels.slice';
import { getUserProfile } from '../../../store/user.slice';

function GameHistoryItem({data}: GameHistoryProps) {
	const { selectedUser, profile } = useSelector((s: RootState) => s.user);
	const dispatch = useDispatch<AppDispatch>();
	const location = useLocation();
	const {channelId, userId} = useParams();

	const chooseLocation = (newUserId: number) => {
		if (location.pathname === '/Settings/Stats') {
			return `/Settings/friend/${newUserId}`;
		} else if (location.pathname === `/Chat/channel/${channelId}/member/${userId}`) {
			return `/Chat/channel/${channelId}/member/${newUserId}`;
		} else if (location.pathname === `/Search/user/${userId}`) {
			return `/Search/user/${newUserId}`;
		} else if (location.pathname === `/Leaderboard/user/${userId}`) {
			return `/Leaderboard/user/${newUserId}`;
		} else {
			return `/Settings/friend/${newUserId}`;
		}
	}
	return (
		<div className={styles['row']}>
			<div className={styles['col']}>{new Date(data.date).toLocaleString()}</div>

			{selectedUser && profile && data.playerId1 != selectedUser.id && data.playerId1 != profile.id
				? <NavLink
					to={chooseLocation(data.playerId1)}
					className={classNames(stylesParent['mail-link'], styles['col'])}
					onClick={() => {
						dispatch(getUserProfile(data.playerId1));
					}}>{data.player1}</NavLink>
				: <div className={styles['col']}>{data.player1}</div>
			}
			{selectedUser && profile && data.playerId2 != selectedUser.id && data.playerId2 != profile.id
				? <NavLink
					to={chooseLocation(data.playerId2)}
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