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

export function CreateChannelFrom() {
	const dispatch = useDispatch<AppDispatch>();
	const user = useSelector((s: RootState) => s.user);
	const channelState = useSelector((s: RootState) => s.channel);
	const [isProtected, setIsProtected] = useState<boolean>(false);
	const [picture, setPicture] = useState<string>('/default_channel_public.png');
	const onChange = (e: FormEvent<HTMLFormElement>) => { //FIXME!
		console.log(e.currentTarget.type.value);
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
		const newChannel: CreateChannel = {
			name: e.currentTarget.name.value,
			type: e.currentTarget.type.value,
			password: e.currentTarget.password ? e.currentTarget.password : '',
			email: user.profile?.email,
			members: [{
				id: user.profile?.id,
				name: user.profile?.username
			}]
		};
		dispatch(channelActions.createChannel(newChannel));
		//console.log(newChannel);
	};

	const updateAvatar = (e: FormEvent<HTMLInputElement>) => {
		const target = e.target as HTMLInputElement;
		const user_id = Number(getCookie('userId'))
				if (user_id && target.files && target.files.length) {
			const avatar = target.files[0];

			const formData = new FormData();
			formData.append('avatar', avatar, );
			const file_name = dispatch(uploadAvatar(formData));
						console.log(`Filename: ${file_name}`);
			const old_filename = target.files[0].name;
			const extension = old_filename.split('.').pop()
			let update_user: UpdateUser = {
				id: user.profile?.id,
				username: user.profile?.username, //FIXME!!! username from the form
				avatar: `http://${import.meta.env.VITE_BACK_HOST}:${import.meta.env.VITE_BACK_PORT}/user/avatars/` + user_id + '.png', //FIXME!!! avatar from the form
				prefferedTableSide: user.profile?.prefferedTableSide,
				pongColorScheme: user.profile?.pongColorScheme,
			};
			
			dispatch(updateProfile(update_user));
			window.location.reload(false);
		}
	}

	useEffect(() => {
		if (channelState.error) {
			console.log(channelState.error);
		}
	}, [channelState.error])

	return <>
		<form className={styles['form']} onChange={onChange} onSubmit={onSubmit}>
			<div className={styles['avatar_setting']}>
				<img className={styles['avatar']} src={picture}/>
				<div className={styles['middle_settings']}>
					<input accept='image/png, image/jpeg, image/jpg' type="file" id='avatar_input' onChange={updateAvatar} hidden/>
					<label htmlFor='avatar_input'><img src='/settings-fill.svg' alt='settings' className={styles['svg']}/></label>
				</div>
			</div>
			<Headling>Create a new channel</Headling>
			{channelState.error ? <div>{channelState.error[0]}</div> : <></>}
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