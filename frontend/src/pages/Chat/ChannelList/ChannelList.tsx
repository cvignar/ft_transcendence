import { ChannelListProps } from './ChannelList.props';
import ChannelPreview from '../../../components/ChannelPreview/ChannelPreview';
import CardButton from '../../../components/CardButton/CardButton';
import styles from './ChannelList.module.css';
export function ChannelList({ channels }: ChannelListProps) {
	console.log(channels);
	return (
		<div className={styles['list']} >
			{channels.map(c => (
				<CardButton className='staff'>
					<ChannelPreview
						key={c.id}
						id={c.id}
						name={c.name}
						createdAt={c.createdAt}
						updatedAt={c.updatedAt}
						type={c.type}
					/>

				</CardButton>
			))}
		</div>
	);
}