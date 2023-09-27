import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import layoutStyles from '../../Layout/Layout.module.css';
import { MembersListProps } from './MembersList.props';
export function MembersList({ onClick }: MembersListProps) {

	return <>
		{/*<h2>New channel</h2>
		<button className={layoutStyles['close-modal']} onClick={onClick}>
			<img className={layoutStyles['close-svg']} src='/remove.svg' alt='close'/>
		</button>
		<form >
			<Input name="name" placeholder='Name'/>
			<fieldset>
				<legend>Type of your channel:</legend>
				<div>
					<input type="radio" id="public" name="type" value="public" defaultChecked />
					<label htmlFor="public">public</label>

					<input type="radio" id="private" name="type" value="private" />
					<label htmlFor="private">private</label>

					<input type="radio" id="protected" name="type" value="protected" />
					<label htmlFor="protected">protected</label>
				</div>
			</fieldset>
			{isProtected && <Input type='password' placeholder='Password' className={styles['settings-input']}/>}*/}
		{/*<Button>Create</Button>
		</form>*/}
	</>;
}