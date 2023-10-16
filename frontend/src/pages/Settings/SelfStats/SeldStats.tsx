import { useDispatch, useSelector } from 'react-redux';
import styles from './SelfStats.module.css';
import { AppDispatch, RootState } from '../../../store/store';
import { msToTime } from '../../../helpers/functions';
import Button from '../../../components/Button/Button';
import GameHistoryItem from '../../MemberPreview/GameHistoryItem/GameHistoryItem';
import { userActions } from '../../../store/user.slice';
import { useState } from 'react';

export function SelfStats() {
	const user = useSelector((s: RootState) => s.user);
	const [showGH, setShowGH] = useState<boolean>(false);
	const dispatch = useDispatch<AppDispatch>();

	const showGameHistory = () => {
		if (user.profile && user.profile.id) {
			dispatch(userActions.getGameHistory(user.profile.id));
			setShowGH(true);
		}
	};

	return (
		<>
			<div className={styles['stats']}>
				<div className={styles['row']}>
					<h4>Rank:</h4>
					<p>{user.profile?.rank}</p>
				</div>
				<div className={styles['row']}>
					<h4>Score:</h4>
					<p>{user.profile?.score}</p>
				</div>
				<div className={styles['row']}>
					<h4>Play time:</h4>
					<p>{msToTime(user.profile?.playTime)}</p>
				</div>
				<div className={styles['row']}>
					<h4>Wins:</h4>
					<p>{user.profile?.gamesWon}</p>
				</div>
				<div className={styles['row']}>
					<h4>Defeats:</h4>
					<p>{user.profile?.gamesLost}</p>
				</div>
				<div className={styles['row']}>
					<h4>Played total:</h4>
					<p>{user.profile?.gamesPlayed}</p>
				</div>
				{showGH === false
					? <Button className={styles['btn-dark']} onClick={showGameHistory}>Show game history</Button>
					: <> <h3>Game History</h3>
						{user.selectedGameHistory && user.selectedGameHistory.length > 0
							? user.selectedGameHistory.map((game: any) => (<GameHistoryItem key={game.id} data={game}/>))
							: <p>Empty</p>}
					</>
				}
			</div>
		</>
	);
}