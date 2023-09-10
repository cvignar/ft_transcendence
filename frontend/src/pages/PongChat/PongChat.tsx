export function PongChat() {
	let userName: string = '';

	setTimeout(() => {userName = 'anka';} );

	const onSubmit = () => {

	};

	return ( <div className='body'>
		<div className='pong-div'>
			{userName ? <iframe className='pong' src={`http://localhost:5000/?nickname=${userName}`} title="pong72"/> : <></>}
		</div>
		<div className='chat-div'>
		</div>
	</div>
	);
}