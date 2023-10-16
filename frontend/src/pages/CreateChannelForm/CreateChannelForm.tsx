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
			setPicture('/default_channel_public.png');
		} else if (e.currentTarget.type.value === 'protected') {
			setIsProtected(true);
			setPicture('/default_channel_protected.png');
		} else if (e.currentTarget.type.value === 'private') {
			setIsProtected(false);
			setPicture('/default_channel_private.png');
		}
	};
	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (e.currentTarget != null) {
			if (e.currentTarget.password != null && user.profile && isProtected) {
			}
			const newChannel: CreateChannel = {
				name: e.currentTarget.name.value,
				type: e.currentTarget.type.value,
				password: e.currentTarget.password ? e.currentTarget.password.value : undefined,
				email: user.profile?.email,
				members: [{
					id: user.profile?.id,
					name: user.profile?.username
				}],
			};
			dispatch(channelActions.createChannel(newChannel));
			setTimeout(() => {
				if (channelState.selectedChannel && channelState.selectedChannel.id != -1 && channelState.error === '') {
					navigate(`/Chat/channel/${channelState.selectedChannel.id}`);
				}
			}, 500);
		}
	};

	useEffect(() => {
		if (channelState.error) {
			const timerId = setTimeout(() => {
				dispatch(channelActions.clearError());
			}, 1000);
			return () => clearTimeout(timerId);

		}
	}, [channelState.error]);

	return <>
		<form className={styles['form']} onChange={onChange} onSubmit={onSubmit}>
			<Headling>Create a new channel</Headling>
			<div className={styles['avatar_setting']}>
				<img className={styles['avatar']} src={picture}/>
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