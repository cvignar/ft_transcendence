import styles from './SearchPreview.module.css';
import { SearchPreviewProps } from './SearchPreview.props';
import { SearchShortInfo } from '../SearchShortInfo/SearchShortInfo';

function SearchPreview(props: SearchPreviewProps) {

	return (
		<div className={styles['preview']}>
			<SearchShortInfo appearence='list' props={props.data}/>
		</div>
	);
}

export default SearchPreview;