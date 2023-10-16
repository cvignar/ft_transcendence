import styles from './Settings.module.css';
import layoutStyles from '../Layout/Layout.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { Profile, UpdateUser } from '../../interfaces/user.interface';
import { GameScheme, Side } from '../../../../pong/static/common';
import Headling from '../../components/Headling/Headling';
import { FormEvent, useEffect, useState } from 'react';
import { disable2fa, enable2fa, getProfile, getUserProfile, updateProfile, uploadAvatar, userActions } from '../../store/user.slice';
import { socket } from '../Pong/pong';
import { msToTime } from '../../helpers/functions';
import Button from '../../components/Button/Button';
import GameHistoryItem from '../MemberPreview/GameHistoryItem/GameHistoryItem';
import QRCode from 'qrcode';
import { getCookie } from 'typescript-cookie';
import { ChannelShortInfo } from '../../components/ChannelShortInfo/ChannelShortInfo';
import CardNavLink from '../../components/CardNavLink/CardNavLink';
import classNames from 'classnames';
import { Outlet } from 'react-router';
import { LeaderboardItem } from '../Leaderboard/LeaderboardItem/LeaderboardItem';

interface PreviousUserData {
	username: string | undefined,
	prefferedTableSide: Side | undefined,
	pongColorScheme: GameScheme | undefined,
	twoFA: boolean | undefined,
}

export function Settings() {

	const user = useSelector((s: RootState) => s.user);
	const dispatch = useDispatch<AppDispatch>();
	const [twoFA, setTwoFA] = useState<boolean>(user.profile ? user.profile.twoFA : false);
	const [showGH, setShowGH] = useState<boolean>(false);
	const [changeUsername, setChangeUsername] = useState<boolean>(false);
	const [error, setError] = useState<string>('');
	const [previousUserData, setPreviousUserData] = useState<PreviousUserData>({
		username: undefined,
		prefferedTableSide: undefined,
		pongColorScheme: undefined,
		twoFA: undefined,
	});

	const onSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setPreviousUserData({
			username: user.profile?.username,
			prefferedTableSide: user.profile?.prefferedTableSide,
			pongColorScheme: user.profile?.pongColorScheme,
			twoFA: user.profile?.twoFA,
		});

		let username = user.profile?.username;
		if (e.currentTarget.username && e.currentTarget.username.value != username) {
			username = e.currentTarget.username.value;
		}
		const updateData: UpdateUser = {
			id: user.profile?.id,
			username: username,
			avatar: user.profile?.avatar,
			prefferedTableSide: parseInt(e.currentTarget.side.value),
			pongColorScheme: parseInt(e.currentTarget.scheme.value)
		};
		if (e.currentTarget.twoFAbox.checked === true && twoFA === false) {
			dispatch(enable2fa());
			setTwoFA(true);
		}
		if (e.currentTarget.twoFAbox.checked === false && twoFA === true) {
			setTwoFA(false);
			dispatch(disable2fa());
		}
		if (updateData.username && /\S/.test(updateData.username) === true && 
			(updateData.username != user.profile?.username ||
			updateData.prefferedTableSide !== user.profile?.prefferedTableSide ||
			updateData.pongColorScheme !== user.profile.pongColorScheme)) {
				dispatch(updateProfile(updateData));
		} else if (!updateData.username || /\S/.test(updateData.username) === false) {
			setError('wrong username');
		}
		setChangeUsername(false);
	};

	const updateAvatar = (e: FormEvent<HTMLInputElement>) => {
		const target = e.target as HTMLInputElement;
		const user_id = Number(getCookie('userId'))
		if (user_id && target.files && target.files.length) {
			const avatar: File = target.files[0];
			const formData = new FormData();
			formData.append('avatar', avatar, );
			const file_name = dispatch(uploadAvatar(formData));
			const old_filename = target.files[0].name;
			const extension = old_filename.split('.').pop()
			const avatar_url = `https://${import.meta.env.VITE_BACK_HOST}:${import.meta.env.VITE_BACK_PORT}/user/avatars/` + user_id + "." + extension + '?';
			let update_user: UpdateUser = {
				id: user.profile?.id,
				username: user.profile?.username,
				avatar: avatar_url,
				prefferedTableSide: user.profile?.prefferedTableSide,
				pongColorScheme: user.profile?.pongColorScheme,
			};
			dispatch(updateProfile(update_user));
			dispatch(getProfile(user_id));
		}
	}

	const showGameHistory = () => {
		if (user.profile && user.profile.id) {
			dispatch(userActions.getFriends(user.profile.id));
			setShowGH(true);
		}
	};

	useEffect(() => {
		dispatch(getProfile(user.userId));
	}, [dispatch, twoFA]);

	useEffect(() => {
		if (user.profile && previousUserData && previousUserData.username &&
			(previousUserData.username !== user.profile.username ||
			previousUserData.prefferedTableSide != user.profile.prefferedTableSide ||
			previousUserData.pongColorScheme != user.profile.pongColorScheme)) {
				socket.emit('new player', {name: user.profile?.username, id: user.profile?.id, side: user.profile?.prefferedTableSide, scheme: user.profile?.pongColorScheme});
		} else if (previousUserData && previousUserData.username === user.profile?.username &&
					previousUserData.twoFA === user.profile?.twoFA) {
				setError('name exists');
		}
	}, [user.profile]);

	useEffect(() => {
		if (user.qrUri) {
			QRCode.toCanvas(document.getElementById('qrcode'), user.qrUri, function (error: any) {
				if (error) console.error(error);
				console.log('success!');
			});
		}
	}, [user.qrUri, user.statuses]);

	useEffect(() => {
		if (error !== '') {
			setTimeout(() => (setError('')), 2000);
		}
	}, [user.profile, error]);
	return (
		<>
			<div className={styles['profile-card']}>
				<div className={styles['empty']}></div>
				<div className={styles['avatar_setting']}>
					<img className={styles['avatar']} src={user.profile?.avatar ? user.profile.avatar + '?' + Date.now() : '/default_avatar.png'}/>
					<div className={styles['middle_settings']}>
						<input accept='image/png, image/jpeg, image/jpg' type="file" id='avatar_input' onChange={updateAvatar} hidden/>
						<label htmlFor='avatar_input'><img src='/settings-fill.svg' alt='settings' className={styles['svg']}/></label>
					</div>
				</div>
				<form className={styles['profile-form']} onSubmit={onSubmit}>
					{changeUsername === true
						? <input type='text' name='username' placeholder={`${user.profile?.username}`} className={styles['username-input']}/>
						: <Headling onClick={() => (setChangeUsername(true))}>{user.profile?.username}</Headling>}
					<div>{user.profile?.email}</div>
					<fieldset>
						<label htmlFor='side' className={styles['label-head']}>Preffered table side:</label>
						<div id='side' className={styles['radio-set']}>
							<div className={styles['radio']}>
								{user.profile?.prefferedTableSide == Side.LEFT
									? <input type="radio" id="LEFT" name="side" value={Side.LEFT} defaultChecked/>
									: <input type="radio" id="LEFT" name="side" value={Side.LEFT}/>
								}
								<label htmlFor="LEFT">left</label>
							</div>
							<div className={styles['radio']}>
								{user.profile?.prefferedTableSide == Side.RIGHT
									? <input type="radio" id="RIGHT" name="side" value={Side.RIGHT} defaultChecked/>
									: <input type="radio" id="RIGHT" name="side" value={Side.RIGHT}/>
								}
								<label htmlFor="RIGHT">right</label>
							</div>
						</div>
					</fieldset>
					<fieldset>
						<label htmlFor='scheme' className={styles['label-head']}>Pong color scheme:</label>
						<div id='scheme' className={styles['radio-set']}>
							<div className={styles['radio']}>
								{user.profile?.pongColorScheme == GameScheme.GENERAL
									? <input type="radio" id="GENERAL" name="scheme" value={GameScheme.GENERAL} defaultChecked/>
									: <input type="radio" id="GENERAL" name="scheme" value={GameScheme.GENERAL}/>
								}
								<label htmlFor="GENERAL">general</label>
							</div>
							<div className={styles['radio']}>
								{user.profile?.pongColorScheme == GameScheme.REVERSE
									? <input type="radio" id="REVERSE" name="scheme" value={GameScheme.REVERSE} defaultChecked/>
									: <input type="radio" id="REVERSE" name="scheme" value={GameScheme.REVERSE}/>
								}
								<label htmlFor="REVERSE">reverse</label>
							</div>
						</div>
					</fieldset>
					<div className={styles['auth-row']}>
						<label htmlFor='enable' className={styles['label-head']}>Google Authentication</label>
							{twoFA === true
							? <input type='checkbox' name='twoFAbox' defaultChecked/>
							: <input type='checkbox' name='twoFAbox'/>}
					</div>
					<div className={styles['row']}>
						<Button className={styles['submit']}>Submit</Button><div className={styles['error']}>{error}</div>
					</div>
				</form>
				{twoFA === true
				? <canvas id='qrcode'/>
				: <></>}

				{showGH === false
					? <Button className={classNames(styles['submit'])} onClick={showGameHistory}>Show friends</Button>
					: <> <h3>Friends</h3>
					{user.friends && user.friends.length > 0
						? user.friends.map((friend: any) => (
							<CardNavLink
								to={`/Settings/friend/${friend.id}`}
								className={classNames(styles['preview-button'])}
								key={friend.id}
								onClick={() => {
									dispatch(getUserProfile(friend.id));
								}}>
								<LeaderboardItem appearence='friend' data={friend}/>
							</CardNavLink>
						))
						: <></>}
					</>
				}

			</div>
			<div className={styles['other']}>
				<Outlet/>
			</div>
		</>
	);
}