import { FormEvent, useState } from 'react';
import './App.css';

export interface UserData {
  username: {
    value: string
  };
  email: {
    value: string
  };
  password: {
    value: string
  };
}

function App() {
	const [userName, setUsername] = useState<string>();

	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		const target = e.target as typeof e.target & UserData;
		const {username, email, password} = target;
		console.log(username.value, email.value, password.value);
		setUsername(username.value);
	};

	return ( <div className='body'>
		<div className='pong-div'>
			{userName ? <iframe className='pong' src={`http://localhost:5000/?nickname=${userName}`} title="pong72"/> : <></>}
		</div>
		<div className='chat-div'>
			<form className='form' onSubmit={onSubmit}>
				<p>FAKE AUTHORIZATION</p>
				<div>
					<label htmlFor='username'>Enter username</label>
					<input type='text' id='username' name='username' placeholder='username'/>
				</div>
				<div>
					<label htmlFor='id42'>Enter username</label>
					<input type='text' id='id42' name='id42' placeholder='id42'/>
				</div>
				<div>
					<label htmlFor='id42'>Enter username</label>
					<input type='text' id='email' name='email' placeholder='email'/>
				</div>
				<div>
					<label htmlFor='id42'>Enter username</label>
					<input id='hash' name='hash' placeholder='hash'/>
				</div>
				<button>Submit</button>
			</form>
		</div>
	</div>
	);
}

export default App;
