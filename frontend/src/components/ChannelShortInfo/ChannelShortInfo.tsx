import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { ChannelPreview } from '../../interfaces/channel.interface';
import ModalContainer from '../ModalContainer/ModalContainer';
import settingStyles from '../../pages/Settings/Settings.module.css';
import styles from './ChannelShortInfo.module.css';
import { ChannelShortInfoProps } from './ChannelShortInfoProps';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store/store';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile, userActions } from '../../store/user.slice';
import { channelActions } from '../../store/channels.slice';
import classNames from 'classnames';
import Button from '../Button/Button';
import Input from '../Input/Input';
export function ChannelShortInfo ({ appearence = 'list', props }: ChannelShortInfoProps) {
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	const user = useSelector((s: RootState) => s.user);
	const channelState = useSelector((s: RootState) => s.channel);
	const [showMuteInput, setShowMuteInput] = useState<boolean>(false);
	const [muteLimit, setMuteLimit] = useState<string>(null);
	const chooseDefaultPicture = () => {
		if (props && props.type) {
			if (props.type === 'public') {
				return '/default_channel_public.png';
			} else if (props.type === 'private') {
				return '/default_channel_private.png';
			} else if (props.type === 'protected') {
				return '/default_channel_protected.png';
			} else {
				return '/default_avatar.png';
			}
		} else if (props) {
			return '/default_avatar.png';
		}
	};

	const IAmAdmin = () => {
		if (channelState.members) {
			for (const member of channelState.members) {
				if (user.profile && user.profile.id === member.id && member.isAdmin === true) {
					return true;
				}
			}
		}
		return false;
	};

	const IAmOwner = () => {
		if (channelState.members) {
			for (const member of channelState.members) {
				if (user.profile && user.profile.id === member.id && member.isOwner === true) {
					return true;
				}
			}
		}
		return false;
	};

	const itIsOwner = () => {
		if (channelState.members) {
			for (const member of channelState.members) {
				if (props && props.id === member.id && member.isOwner === true) {
					return true;
				}
			}
		}
		return false;
	};

	const getRole = () => {
		if (appearence !== 'member') {
			return '';
		}
		if (props.isOwner === true) {
			return 'owner';
		} else if (props.isAdmin === true) {
			return 'admin';
		} else if (props.isBlocked === true) {
			return 'blocked';
		} else if (props.isMuted === true) {
			return 'muted';
		} else {
			return 'member';
		}

	};

	const makeAdmin = () => {
		if (props && props.id && channelState.selectedChannel) {
			dispatch(channelActions.makeAdmin({userId: props.id, channelId: channelState.selectedChannel.id}));
		}
	};

	const removeAdmin = () => {
		if (props && props.id && channelState.selectedChannel) {
			dispatch(channelActions.removeAdmin({userId: props.id, channelId: channelState.selectedChannel.id}));
		}
	};

	const blockMember = () => {
		if (channelState.selectedChannel && props.id) {
			dispatch(channelActions.blockMember({userId: props.id, channelId: channelState.selectedChannel.id}));
		}
	};

	const unblockMember = () => {
		if (channelState.selectedChannel && props.id) {
			dispatch(channelActions.unblockMember({userId: props.id, channelId: channelState.selectedChannel.id}));
		}
	};

	const kickMember = () => {
		if (channelState.selectedChannel && props.id) {
			dispatch(channelActions.kickMember({userId: props.id, channelId: channelState.selectedChannel.id}));
		}
	};

	const muteChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.currentTarget) {
			setMuteLimit(e.currentTarget.value);
		}
	};

	const cancelMute = () => {
		setMuteLimit('');
		setShowMuteInput(false);
	};

	const muteMember = () => {
		if (muteLimit != '' && props && channelState.selectedChannel) {
			const muteData = {
				finishAt: muteLimit,
				userId: Number(props.id),
				channelId: channelState.selectedChannel.id
			};
			dispatch(channelActions.muteMember(muteData));
			setShowMuteInput(false);
		}
	};

	const unmuteMember = () => {
		if (props && channelState.selectedChannel) {
			const muteData = {
				userId: Number(props.id),
				channelId: channelState.selectedChannel.id,
			};
			dispatch(channelActions.unmuteMember(muteData));
		}
	};

	return (
		<div className={classNames(styles['card'],
			appearence !== 'list' ? styles['card-no-list'] : '')}>
			<div className={classNames(styles['info'],
				appearence === 'member' ? styles['info-no-list'] : '')}>
				<div className={appearence === 'member'
					? styles['member-row']
					: styles['normal']}>
					<img
						className={appearence === 'member'
							? styles['avatar-member']
							: styles['avatar']}
						src={props?.picture ? props.picture : (props.avatar ? props.avatar : chooseDefaultPicture())}
						onClick={() => {
							if (props.type && props.type == 'direct') {
								dispatch(getUserProfile(props.ownerId));
								navigate(`/Chat/channel/${props.id}/member/:${props.ownerId}`);
							} else if (props.type && props.type != 'direct' && user.profile) {
								dispatch(channelActions.getSelectedChannel(props.id));
								dispatch(channelActions.readChannelStatus({channelId: props.id, email: user.profile.email}));
								navigate(`/Chat/channel/${props.id}/settings`);
							} else if (props.username) {
								if (user.profile && props.id != user.profile.id) {
									dispatch(getUserProfile(props.id));
									navigate(`/Chat/channel/${channelState.selectedChannel.id}/member/:${props.id}`);
								} else if (user.profile && props.id == user.profile.id) {
									navigate('/Settings/Stats');
								}
							}
						}}/>
					{appearence === 'member' && itIsOwner() === false && (IAmAdmin() === true || IAmOwner() === true)
						? <div className={styles['member-btns']}>
							{IAmOwner() === true
								? <>
									{props.isAdmin
										? <Button className={classNames(settingStyles['btn-dark'], styles['btn-smaller'])} onClick={removeAdmin}>Remove admin</Button>
										: <Button className={classNames(settingStyles['btn-dark'], styles['btn-smaller'])} onClick={makeAdmin}>Make admin</Button>
									}
								</>
								: <></>
							}
							{IAmAdmin() === true
								? <>
									{props.isBlocked
										? <Button className={classNames(settingStyles['btn-dark'], styles['btn-smaller'])} onClick={unblockMember}>Unblock</Button>
										: <Button className={classNames(settingStyles['btn-dark'], styles['btn-smaller'])} onClick={blockMember}>Block</Button>}
									<Button className={classNames(settingStyles['btn-dark'], styles['btn-smaller'])} onClick={kickMember}>Kick</Button>
									{props.isMuted
										? <Button className={classNames(settingStyles['btn-dark'], styles['btn-smaller'])} onClick={unmuteMember}>Unmute</Button>
										: showMuteInput === false
											? <Button className={classNames(settingStyles['btn-dark'], styles['btn-smaller'])} onClick={() => setShowMuteInput(true)}>Mute</Button>
											: <>
											</>}
								</>
								: <></>
							}
						</div>
						: <></>}
					{appearence === 'member' && IAmAdmin() === false && IAmOwner() === false
						? <div className={styles['role']}>{getRole()}</div>
						: <></>}

				</div>
				<div className={classNames(styles['header-message'], appearence === 'member'
					? styles['header-message-member'] : '')}>
					<div className={appearence === 'member'
						? styles['header-member']
						: styles['header']}>{props?.name ? props.name : (props.username ? props.username : '')}</div>
					{appearence === 'list' ? <div className={styles['message']}>{props?.lastMessage ? props.lastMessage : ''}</div> : ''}
				</div>
				{appearence === 'member' && showMuteInput === true
					? <div className={styles['mute-limit']}>
						<input name="mute_limit" type='datetime-local' onChange={muteChange}/>
						<Button className={classNames(settingStyles['btn-dark'], styles['btn-smaller'])} onClick={muteMember}>Submit</Button>
						<Button className={classNames(settingStyles['btn-dark'], styles['btn-smaller'])} onClick={cancelMute}>Cancel</Button>
					</div>
					: <></>}
			</div>
		</div>
	);

}