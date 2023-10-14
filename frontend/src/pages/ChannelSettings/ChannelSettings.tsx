import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Headling from '../../components/Headling/Headling';
import styles from './ChannelSettings.module.css';
import Input from '../../components/Input/Input';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import Button from '../../components/Button/Button';
import settingStyles from '../CreateChannelForm/CreateChannelForm.module.css';
import classNames from 'classnames';
import CardNavLink from '../../components/CardNavLink/CardNavLink';
import { getUserProfile } from '../../store/user.slice';
import { ChannelShortInfo } from '../../components/ChannelShortInfo/ChannelShortInfo';
import { ChannelsState, channelActions } from '../../store/channels.slice';
import { typeEnum } from '../../../../contracts/enums';
import { useParams } from 'react-router-dom';
import { getCookie } from 'typescript-cookie';
import { uploadChannelAvatar } from '../../store/channels.slice'
// import bcrypt from 'bcryptjs';
import { updateChannel } from '../../interfaces/updateChannel.interface';
// import { salt } from '../../helpers/hashing';

function ChannelSettings() {
	const [picture, setPicture] = useState<string>('/default_channel_public.png');
	const channelState = useSelector((s: RootState) => s.channel);
	const user = useSelector((s: RootState) => s.user);
	const [isProtected, setIsProtected] = useState<boolean>(false);
	const [passwordInput, setPasswordInput] = useState<boolean>(false);
	const [showMmbrs, setShowMmbrs] = useState<boolean>(false);
	const dispatch = useDispatch<AppDispatch>();
	const [password, setPassword] = useState<string | null>(null);
	const {channelId} = useParams();

	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		// let hashed_password: string | undefined = undefined;
		// let hashed_new_password: string | undefined = undefined;
		// if (e.currentTarget.password) {
		// 	hashed_password = await bcrypt.hash(e.currentTarget.password, salt);
		// }
		// if (e.currentTarget.new_password) {
		// 	hashed_new_password = await bcrypt.hash(e.currentTarget.password, salt);
		// }
		const updateChannel: updateChannel = {
			id: channelState.selectedChannel.id,
			type: e.currentTarget.type.value,
			email: channelState.selectedChannel.ownerEmail,
			// password: hashed_password? hashed_password : null,
			password: e.currentTarget.password? e.currentTarget.password.value : null,
			memberId: user.profile.id,
			newPassword: e.currentTarget.new_password ? e.currentTarget.new_password.value : null,

		};
		console.log(updateChannel);
		// dispatch(channelActions.updateChannel(updateChannel));
		// setTimeout(() => {
		// 	if (channelState.selectedChannel && channelState.selectedChannel.id != -1) {
		// 		navigate(`/Chat/channel/${channelState.selectedChannel.id}`);
		// 	}
		// }, 500);
	};

	const onChange = (e: FormEvent<HTMLFormElement>) => { //FIXME!
		if (channelState.selectedChannel.picture !== null && channelState.selectedChannel.picture !== '')
		{
			return ;
		}
		if (e.currentTarget.type.value === 'public') {
			setIsProtected(false);
			setPicture('/default_channel_public.png');
		} else if (e.currentTarget.type.value === 'protected') {
			setIsProtected(true);
			setPicture('/default_channel_protected.png');
		} else if (e.currentTarget.type.value === 'private') {
			setIsProtected(false);
			setPicture('/default_channel_private.png');
		}
	};

	const updateChannelAvatar = (e: FormEvent<HTMLInputElement>) => {
		const target = e.target as HTMLInputElement;
		const user_id = Number(getCookie('userId'))

		if (user_id && target.files && target.files.length && channelState.selectedChannel && user.profile) {
			const avatar = target.files[0];

			const formData = new FormData();
			formData.append('avatar', avatar, );
			dispatch(uploadChannelAvatar({ channelId: channelState.selectedChannel.id, img_data: formData}));
			
			// get url from backend
			setTimeout(() => {
				setPicture(channelState.selectedChannel.picture);
			}, (500));
		}
	};
	
	const showMembers = () => {
		if (channelState.selectedChannel && channelState.selectedChannel.id && user.profile) {
			dispatch(channelActions.readChannelStatus({channelId: channelState.selectedChannel.id, email: user.profile.email}));
			setShowMmbrs(true);
		}
	};

	const joinChannel = () => {
		let hashed_password: string | null = null;
		if (channelState.selectedChannel && user.profile) {
			// if (channelState.selectedChannel.type === typeEnum.PROTECTED && password) {
			// 	hashed_password = bcrypt.hash(password, channelState.selectedChannel.ownerEmail);
			// }
			const joinData = {
				id: channelState.selectedChannel.id,
				type: channelState.selectedChannel.type,
				email: user.profile.email,
				password: password ? password : null, //FIXME!!! formData password!
				memberId: -1,
				newPassword: null //FIXME!!! formData newPassword
			};
			dispatch(channelActions.joinChannel(joinData));
			dispatch(channelActions.readChannelStatus({channelId: channelState.selectedChannel.id, email: user.profile.email}));
		}
		// setShowMmbrs(false);
	};

	const checkProtected = () => {
		if (channelState.selectedChannel && channelState.selectedChannel.type === typeEnum.PROTECTED) {
			if (passwordInput === true) {
				setPasswordInput(false);
				joinChannel();
			} else if (channelState.selectedChannel) {
				setPasswordInput(true);
			}
		} else {
			setPasswordInput(false);
			setPassword(null);
			joinChannel();
		}
	};

	const leaveChannel = () => {
		if (channelState.selectedChannel && user.profile) {
			const joinData = {
				id: channelState.selectedChannel.id,
				type: channelState.selectedChannel.type,
				email: user.profile.email,
				password: null, //FIXME!!! formData password!
				memberId: -1,
				newPassword: null //FIXME!!! formData newPassword
			};
			dispatch(channelActions.leaveChannel(joinData));
			dispatch(channelActions.readChannelStatus({channelId: channelState.selectedChannel.id, email: user.profile.email}));
		}
	};

	const IAmMember = () => {
		if (channelState.members) {
			for (const member of channelState.members) {
				if (user.profile && user.profile.id === member.id) {
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

	const getPassword = (e: ChangeEvent<HTMLInputElement>) => {
		setPassword(e.currentTarget.value);
	};

	useEffect(() => {
		if (channelId != undefined) {
			dispatch(channelActions.getSelectedChannel(Number(channelId)));
		}
	}, [channelId]);

	useEffect(() => {
		if (channelState.selectedChannel) {
			setPicture(channelState.selectedChannel.picture);
		}
	}, [channelState.selectedChannel]);

	return (
		<>
			<div className={styles['channel-card']}>
				<form className={settingStyles['form']} onSubmit={onSubmit} onChange={onChange}>
					<div className={styles['join']}>
						<div className={settingStyles['avatar_setting']}>
							<img className={settingStyles['avatar']} src={picture}/>
							{IAmOwner() === true
								? <>
									<div className={settingStyles['middle_settings']}>
										<input accept='image/png, image/jpeg, image/jpg' type="file" id='avatar_input' onChange={updateChannelAvatar} hidden/>
										<label htmlFor='avatar_input'><img src='/settings-fill.svg' alt='settings' className={settingStyles['svg']}/></label>
									</div>
								</>
								: <></>}
						</div>
						<Headling onClick={() => {}}>{channelState.selectedChannel?.name}</Headling>
						<div className={styles['guard']}>
							{IAmOwner() === false
								? IAmMember() === false 
									? <Button
										className={classNames(settingStyles['btn-dark'], styles['join-btn'])}
										onClick={checkProtected}>Join</Button>
									: <Button
										className={classNames(settingStyles['btn-dark'], styles['join-btn'])}
										onClick={leaveChannel}>Leave</Button>
								: <></>}
							{passwordInput === true
								? <input type='password' name='password' placeholder='password' onChange={getPassword}/>
								: <></>}
						</div>
					</div>
					{channelState.error ? <div>{channelState.error}</div> : <></>}
					{IAmOwner() === true
						? <>
							<fieldset>
								<label htmlFor='type-radio' className={classNames(settingStyles['radio-set'], styles['radio-set'])}>
									Type of your channel
								</label>
								<div id='type-radio' className={settingStyles['radio-set']}>
									{channelState.selectedChannel && channelState.selectedChannel.type === typeEnum.PUBLIC
										? <input type="radio" id="public" name="type" value="public" defaultChecked />
										: <input type="radio" id="public" name="type" value="public" />}
									<label htmlFor="public">public</label>

									{channelState.selectedChannel && channelState.selectedChannel.type === typeEnum.PRIVATE
										? <input type="radio" id="private" name="type" value="private" defaultChecked />
										: <input type="radio" id="private" name="type" value="private" />}
									<label htmlFor="private">private</label>

									{channelState.selectedChannel && channelState.selectedChannel.type === typeEnum.PROTECTED
										? <input type="radio" id="protected" name="type" value="protected" defaultChecked />
										: <input type="radio" id="protected" name="type" value="protected" />}
									<label htmlFor="protected">protected</label>
								</div>
							</fieldset>
							{
								isProtected && channelState.selectedChannel.type !== typeEnum.PROTECTED &&
								<Input type='password' placeholder='New password' name='new_password' className={settingStyles['input']}/>
							}
							{
								isProtected && channelState.selectedChannel.type === typeEnum.PROTECTED &&
								<><Input type='password' placeholder='Password' name='password' className={settingStyles['input']}/>
								<Input type='password' placeholder='New password' name='new_password' className={settingStyles['input']}/></>
							}
							<Button className={classNames(settingStyles['button'], styles['button'])}>Submit</Button>
						</>
						: <></>}
					{showMmbrs === false
						? <Button className={classNames(settingStyles['button'], styles['button'])} onClick={showMembers}>Show members</Button>
						: <div className={styles['members']}> <h4 className={styles['headling']}>Members</h4>
							{channelState.members && channelState.members.length > 0
								? channelState.members.map((member: any) => (
									<ChannelShortInfo key={member.id} appearence='member' props={member}/>
								))
								: <></>}
						</div>
					}
				</form>
			</div>
		</>
	);
}

export default ChannelSettings;