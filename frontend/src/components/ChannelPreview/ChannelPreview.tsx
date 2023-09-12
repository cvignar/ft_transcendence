import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { BACK_PREFIX } from '../../helpers/API';
import { ChannelPreview } from '../../interfaces/channel.interface';
//import { ChannelPreviewProps } from './ChannelPreview.props';

function ChannelPreview(props: ChannelPreview) {
	const	formatedDate = new Intl.DateTimeFormat('lt-LT').format(new Date(props.updatedAt));
	return (
		<div>
			<h3>{props.name}</h3>
			<p>Updated at {formatedDate}</p>
		</div>
	);
}

export default ChannelPreview;