import classNames from 'classnames';
import { FormEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Headling from '../../components/Headling/Headling';
import Input from '../../components/Input/Input';
import { channelActions } from '../../store/channels.slice';
import { AppDispatch, RootState } from '../../store/store';
import { userActions } from '../../store/user.slice';
import { Pong } from '../Pong/pong';
import styles from './CreateChannelForm.module.css';
import { CreateChannel } from '../../interfaces/createChannel.interface';
import { getCookie } from 'typescript-cookie';
import bcrypt from 'bcryptjs';
import { uploadChannelAvatar } from '../../store/channels.slice';

export function CreateChannelFrom() {
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	const user = useSelector((s: RootState) => s.user);
	const channelState = useSelector((s: RootState) => s.channel);
	const [isProtected, setIsProtected] = useState<boolean>(false);
	const [ChannelAvatar, setChannelAvatar] = useState<File | null>(null);	// stored until the channel will be created
	const [picture, setPicture] = useState<string>('/default_channel_public.png');

	const onChange = (e: FormEvent<HTMLFormElement>) => { //FIXME!
		if (e.currentTarget.type.value === 'public') {
			setIsProtected(false);
			setPicture('/default_channel_public.png')
		} else if (e.currentTarget.type.value === 'protected') {
			setIsProtected(true);
			setPicture('/default_channel_protected.png')
		} else if (e.currentTarget.type.value === 'private') {
			setIsProtected(false);
			setPicture('/default_channel_private.png')
		}
	};
	const onSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		let hashed_password: string | undefined = undefined;
		if (e.currentTarget.password) {
			hashed_password = bcrypt.hash(e.currentTarget.password, user.profile?.email);
		}
		const newChannel: CreateChannel = {
			name: e.currentTarget.name.value,
			type: e.currentTarget.type.value,
			password: e.currentTarget.password ? hashed_password : undefined,
			email: user.profile?.email,
			members: [{
				id: user.profile?.id,
				name: user.profile?.username
			}],
		};
		dispatch(channelActions.createChannel(newChannel));
		setTimeout(() => {
			if (channelState.selectedChannel && channelState.selectedChannel.id != -1) {
				navigate(`/Chat/channel/${channelState.selectedChannel.id}`);
			}
		}, 500);
		// CVIGNAR: get new channel id to upload the channel avatar
		const new_channel_id = 0;
		if (ChannelAvatar) {
			const formData = new FormData();
			formData.append('avatar', ChannelAvatar, );
			const file_name = dispatch(uploadChannelAvatar({channelId: new_channel_id ,img_data: formData}));
			const old_filename = ChannelAvatar.name;
			const extension = old_filename.split('.').pop();
			const avatar_url = `http://${import.meta.env.VITE_BACK_HOST}:${import.meta.env.VITE_BACK_PORT}/user/avatars/` + new_channel_id + extension;
			// CVIGNAR: need to update frontend avatar url for the new channel
		}
		// updateChannelAvatar();
	};

	const updateChannelAvatar = (e: FormEvent<HTMLInputElement>) => {
		const target = e.target as HTMLInputElement;
		const user_id = Number(getCookie('userId'))
		if (user_id && target.files && target.files.length) {
			setChannelAvatar(target.files[0]);
			// CVIGNAR: setPicture can be set to the new selected profile picture... not sure this will work
		}
	};

	useEffect(() => {
		if (channelState.error) {
			console.log(channelState.error);
		}
	}, [channelState.error])

	return <>
		<form className={styles['form']} onChange={onChange} onSubmit={onSubmit}>
			<Headling>Create a new channel</Headling>
			<div className={styles['avatar_setting']}>
				<img className={styles['avatar']} src={picture}/>
				<div className={styles['middle_settings']}>
					<input accept='image/png, image/jpeg, image/jpg' type="file" id='avatar_input' name='avatar_input' onChange={updateChannelAvatar} hidden/>
					<label htmlFor='avatar_input'><img src='/settings-fill.svg' alt='settings' className={styles['svg']}/></label>
				</div>
			</div>
			{channelState.error ? <div>{channelState.error}</div> : <></>}
			<Input className={styles['input']} type='text' name='name' placeholder='Channel name' autoComplete='off'/>
			<fieldset>
				<label htmlFor='type-radio' className={styles['radio-set']}>
					Type of your channel
				</label>
				<div id='type-radio' className={styles['radio-set']}>
					<input type="radio" id="public" name="type" value="public" defaultChecked />
					<label htmlFor="public">public</label>

					<input type="radio" id="private" name="type" value="private" />
					<label htmlFor="private">private</label>

					<input type="radio" id="protected" name="type" value="protected" />
					<label htmlFor="protected">protected</label>
				</div>
			</fieldset>
			{isProtected && <Input type='password' placeholder='Password' name='password' className={styles['input']}/>}
			<Button className={styles['button']}>Create</Button>
		</form>
	</>;
}