import styles from './Settings.module.css';
import layoutStyles from '../Layout/Layout.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { UpdateUser } from '../../interfaces/user.interface';
import { GameScheme, Side } from '../../../../pong/static/common';
import Headling from '../../components/Headling/Headling';
import { FormEvent, useEffect, useState } from 'react';
import { getProfile, updateProfile, userActions } from '../../store/user.slice';
import { socket } from '../Pong/pong';
import { msToTime } from '../../helpers/functions';

export function Settings() {
	const user = useSelector((s: RootState) => s.user);
	const dispatch = useDispatch<AppDispatch>();

	const onSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		console.log(e.currentTarget.side.value);
		console.log(e.currentTarget.scheme.value);
		const updateData: UpdateUser = {
			id: user.userId,
			username: user.username, //FIXME!!! username from the form
			avatar: user.profile?.avatar, //FIXME!!! avatar from the form
			prefferedTableSide: parseInt(e.currentTarget.side.value),
			pongColorScheme: parseInt(e.currentTarget.scheme.value)
		};
		console.log('new player');
		socket.emit('new player', {name: updateData.username, id: updateData.id, side: updateData.prefferedTableSide, scheme: updateData.pongColorScheme});
		dispatch(updateProfile(updateData));
	};

	useEffect(() => {
		dispatch(getProfile(user.userId));
	}, [dispatch, user.userId]);

	return (
		<>
			<div className={styles['profile-card']}>
				<form className={styles['profile-form']} onSubmit={onSubmit}>
					<img className={styles['avatar']} src={user.profile?.avatar ? user.profile.avatar : '/default_avatar.png'}/>
					<Headling>{user.username}</Headling>
					<div>{user.email}</div>
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
					<button className={styles['done-button']}>
						<img src='/done.svg' className={styles['done']}/>
					</button>
				</form>
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
				</div>
				{/*<div>{user.profile?.}</div>
				<div>{user.profile?.}</div>
				<div>{user.profile?.}</div>*/}
			</div>
			<div className={styles['other']}></div>
		</>
	);
}