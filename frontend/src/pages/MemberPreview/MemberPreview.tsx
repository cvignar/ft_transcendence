import { useSelector } from 'react-redux';
import styles from './MemberPreview.module.css';
import { RootState } from '../../store/store';
import Headling from '../../components/Headling/Headling';
import { msToTime } from '../../helpers/functions';
import Button from '../../components/Button/Button';


function MemberPreview() {
	const profile = useSelector((s: RootState) => s.user.selectedUser);

	return (
		<>
			<div className={styles['member-card']} onLoad={() => {}}>
				<img className={styles['avatar']} src={profile?.avatar ? profile.avatar : '/default_avatar.png'}/>
				<Headling>{profile?.username}</Headling>
				<div>{profile?.email}</div>
				<div className={styles['table']}>
					<div className={styles['col']}>
						<Button>Add to friends</Button>
						<Button>Direct chat</Button>
						<Button className={styles['inActive']}>Invite to game</Button>
					</div>
					<div className={styles['col']}>
						<Button>Block</Button>
						<Button>Mute</Button>
					</div>
				</div>
				<div className={styles['stats']}>
					<div className={styles['row']}>
						<h4>Rank:</h4>
						<p>{profile?.rank}</p>
					</div>
					<div className={styles['row']}>
						<h4>Score:</h4>
						<p>{profile?.score}</p>
					</div>
					<div className={styles['row']}>
						<h4>Play time:</h4>
						<p>{msToTime(profile?.playTime)}</p>
					</div>
					<div className={styles['row']}>
						<h4>Wins:</h4>
						<p>{profile?.gamesWon}</p>
					</div>
					<div className={styles['row']}>
						<h4>Defeats:</h4>
						<p>{profile?.gamesLost}</p>
					</div>
					<div className={styles['row']}>
						<h4>Played total:</h4>
						<p>{profile?.gamesPlayed}</p>
					</div>
				</div>
			</div>
		</>
	);
}

export default MemberPreview;