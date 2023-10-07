import { useDispatch, useSelector } from 'react-redux';
import styles from './MemberPreview.module.css';
import { AppDispatch, RootState } from '../../store/store';
import Headling from '../../components/Headling/Headling';
import { msToTime } from '../../helpers/functions';
import Button from '../../components/Button/Button';
import { Status } from '../../helpers/enums';
import { socket } from '../Pong/pong';
import { userActions } from '../../store/user.slice';


function MemberPreview() {
	const { profile, selectedUser } = useSelector((s: RootState) => s.user);
	const statusMap = useSelector((s: RootState) => s.user.statuses);
	const dispatch = useDispatch<AppDispatch>();

	const findStatus = (statuses: any) => {
		for (const status of statuses) {
			if (Number(status[0]) === Number(selectedUser?.id))
				return status[1];
		}
	};
	const emitInvite = () => {
		if (selectedUser && findStatus(statusMap) === Status.online) {
			socket.emit('invite partner', Number(selectedUser.id));
		}
	};

	const emitAdd = () => {
		if (profile && selectedUser) {
			dispatch(userActions.addFriend({selfId: profile.id, friendId: selectedUser.id}));
		}
	};

	const isAdding = () => {
		if (profile && selectedUser && profile.adding.includes(selectedUser.id)) {
			return true;
		}
		return false;
	};

	const isBlocking = () => {
		if (profile && selectedUser && profile.blocking.includes(selectedUser.id)) {
			return true;
		}
		return false;
	};

	const emitRemoveFriend = () => {
		if (profile && selectedUser) {
			dispatch(userActions.removeFriend({selfId: profile.id, friendId: selectedUser.id}));
		}
	};

	const emitBlockUser = () => {
		if (profile && selectedUser) {
			dispatch(userActions.blockUser({selfId: profile.id, friendId: selectedUser.id}));
		}
	};

	const emitUnblockUser = () => {
		if (profile && selectedUser) {
			dispatch(userActions.unblockUser({selfId: profile.id, friendId: selectedUser.id}));
		}
	};

	return (
		<>
			<div className={styles['member-card']} onLoad={() => {}}>
				<img className={styles['avatar']} src={selectedUser?.avatar ? selectedUser.avatar : '/default_avatar.png'}/>
				<Headling>{selectedUser?.username}</Headling>
				<div>{selectedUser?.email}</div>
				<div className={styles['table']}>
					<div className={styles['col']}>
						{isAdding() === true
							? <Button className={styles['btn-dark']} onClick={emitRemoveFriend}>Remove friend</Button>
							: <Button className={styles['btn-dark']} onClick={emitAdd}>Add to friends</Button>
						}
						<Button className={styles['btn-dark']}>Direct chat</Button>
						<Button
							className={findStatus(statusMap) !== Status.online
								? styles['inActive']
								: styles['btn-dark']}
							onClick={emitInvite}>Invite to game</Button>
					</div>
					<div className={styles['col']}>
						{isBlocking() === true
							? <Button className={styles['btn-dark']} onClick={emitUnblockUser}>Unblock</Button>
							: <Button className={styles['btn-dark']} onClick={emitBlockUser}>Block</Button>}
						<Button className={styles['btn-dark']}>Mute</Button>
					</div>
				</div>
				<div className={styles['stats']}>
					<div className={styles['row']}>
						<h4>Rank:</h4>
						<p>{selectedUser?.rank}</p>
					</div>
					<div className={styles['row']}>
						<h4>Score:</h4>
						<p>{selectedUser?.score}</p>
					</div>
					<div className={styles['row']}>
						<h4>Play time:</h4>
						<p>{msToTime(selectedUser?.playTime)}</p>
					</div>
					<div className={styles['row']}>
						<h4>Wins:</h4>
						<p>{selectedUser?.gamesWon}</p>
					</div>
					<div className={styles['row']}>
						<h4>Defeats:</h4>
						<p>{selectedUser?.gamesLost}</p>
					</div>
					<div className={styles['row']}>
						<h4>Played total:</h4>
						<p>{selectedUser?.gamesPlayed}</p>
					</div>
				</div>
			</div>
		</>
	);
}

export default MemberPreview;