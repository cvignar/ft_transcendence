import { useDispatch, useSelector } from 'react-redux';
import styles from './MemberPreview.module.css';
import { AppDispatch, RootState } from '../../store/store';
import Headling from '../../components/Headling/Headling';
import { msToTime } from '../../helpers/functions';
import Button from '../../components/Button/Button';
import { Status } from '../../helpers/enums';
import { socket } from '../Pong/pong';
import { getUserProfile, userActions } from '../../store/user.slice';
import { channelActions } from '../../store/channels.slice';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import GameHistoryItem from './GameHistoryItem/GameHistoryItem';

function MemberPreview() {
	const { profile, selectedUser, selectedGameHistory } = useSelector((s: RootState) => s.user);
	const { selectedChannel, channels } = useSelector((s: RootState) => s.channel);
	const statusMap = useSelector((s: RootState) => s.user.statuses);
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const [goToDM, setGoToDM] = useState<boolean>(false);
	const [showGH, setShowGH] = useState<boolean>(false);
	const [watch, setWatch] = useState<boolean>(false);
	const { userId } = useParams();
	const location = useLocation();

	const findStatus = (statuses: any) => {
		for (const status of statuses) {
			if (selectedUser && Number(status[0]) === Number(selectedUser.id))
				return status[1];
		}
		return '';
	};

	const myStatus = (statuses: any) => {
		for (const status of statuses) {
			if (profile && Number(status[0]) === Number(profile.id))
				return status[1];
		}
	};

	const emitInvite = () => {
		if (selectedUser && findStatus(statusMap) === Status.online && isBlocked() === false) {
			socket.emit('invite partner', Number(selectedUser.id));
		}
	};

	const emitAdd = () => {
		if (profile && selectedUser && isBlocked() === false) {
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

	const isBlocked = () => {
		if (profile && selectedUser && profile.blocked.includes(selectedUser.id)) {
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

	const getDirectChannel = () => {
		if (profile && selectedUser && isBlocked() === false) {
			dispatch(channelActions.setSelectedChannel(null));
			dispatch(channelActions.getDirectChannel({targetId: selectedUser.id, selfEmail: profile?.email}));
			setGoToDM(true);
		}
	};

	const showGameHistory = () => {
		if (selectedUser && selectedUser.id) {
			dispatch(userActions.getGameHistory(selectedUser.id));
			setShowGH(true);
		}
	};

	useEffect(() => {
		if (goToDM && selectedChannel && selectedChannel.id) {
			navigate(`/Chat/channel/${selectedChannel.id}`);
		}
	}, [selectedChannel]);

	useEffect(() => {
		setShowGH(false);
	}, [selectedUser]);

	useEffect(() => {
		if (isBlocked() === true) {
			stopWatch();
		}
	}, [profile]);

	const watchGame = () => {
		setWatch(true);
		if (selectedUser) {
			socket.emit('whatch game', selectedUser.id);
		}
	};
	
	const stopWatch = () => {
		setWatch(false);
		if (profile) {
			socket.emit('stop watch', { name: profile.username, id: profile.id, side: profile?.prefferedTableSide, scheme: profile?.pongColorScheme });
		}
	};

	useEffect(() => {
		if(userId) {
			dispatch(getUserProfile(Number(userId)));
		}
	}, [userId]);

	return (
		<>
			<div className={styles['member-card']} onLoad={() => {}}>
				<div className={styles['empty']}></div>
				<img className={styles['avatar']} src={selectedUser?.avatar ? selectedUser.avatar : '/default_avatar.png'}/>
				<Headling>{selectedUser?.username}</Headling>
				{isBlocked() === true
					? <div>{`You are blocked by ${selectedUser?.username} :(`}</div>
					: <a className={styles['mail-link']} href={`mailto:${selectedUser?.email}`}>{selectedUser?.email}</a>}
				<div className={styles['table']}>
					<div className={styles['col']}>
						{isAdding() === true
							? <Button className={styles['btn-dark']} onClick={emitRemoveFriend}>Remove friend</Button>
							: <Button className={isBlocked() === true
													? styles['inActive']
													: styles['btn-dark']
												} onClick={emitAdd}>Add to friends</Button>
						}
						<Button
							className={findStatus(statusMap) !== Status.online
								|| isBlocked() === true
									? styles['inActive']
									: styles['btn-dark']}
							onClick={emitInvite}>Invite to game</Button>
						{profile &&
							selectedUser &&
							findStatus(statusMap) === Status.playing &&
							isBlocked() === false &&
							myStatus(statusMap) !== Status.playing ? 
							watch === false
								? <Button
									className={styles['btn-dark']}
									onClick={watchGame}>Watch game</Button>
								: <Button
									className={styles['btn-dark']}
									onClick={stopWatch}>Stop watch</Button>
							: <></>}
					</div>
					<div className={styles['col']}>
						<Button className={isBlocked() === true
									? styles['inActive']
									: styles['btn-dark']}
								onClick={getDirectChannel}
								>Direct chat</Button>
						{isBlocking() === true
							? <Button className={styles['btn-dark']} onClick={emitUnblockUser}>Unblock</Button>
							: <Button className={styles['btn-dark']} onClick={emitBlockUser}>Block</Button>}
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
					{showGH === false
						? <Button className={styles['btn-dark']} onClick={showGameHistory}>Show game history</Button>
						: <> <h3>Game History</h3>
							{selectedGameHistory && selectedGameHistory.length > 0
								? selectedGameHistory.map((game: any) => (<GameHistoryItem key={game.id} data={game}/>))
								: <p>Empty</p>}
						</>
					}
				</div>
			</div>
		</>
	);
}

export default MemberPreview;