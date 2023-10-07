import ChannelPreview from '../../../components/ChannelPreview/ChannelPreview';
import CardButton from '../../../components/CardButton/CardButton';
import styles from './SearchList.module.css';
import classNames from 'classnames';
import Headling from '../../../components/Headling/Headling';
import Search from '../../../components/Search/Search';
import { Navigate, NavLink, useNavigate } from 'react-router-dom';
import CardNavLink from '../../../components/CardNavLink/CardNavLink';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { channelActions } from '../../../store/channels.slice';
import { ChangeEvent, FocusEvent, useEffect, useState } from 'react';
import { SearchListProps } from './SearchList.props';
import SearchPreview from '../SearchPreview/SearchPreview';
import { getUserProfile } from '../../../store/user.slice';

export function SearchList({ setChannel, isActive, setActive }: SearchListProps) {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const compareNames = (a: any, b: any) => {
		if ( a.name.toLowerCase() < b.name.toLowerCase() ){
			return -1;
		}
		if ( a.name.toLowerCase() > b.name.toLowerCase() ){
			return 1;
		}
		return 0;
	};
	let search = Array.from(useSelector((s: RootState) => s.channel.search), x => x).sort(compareNames);
	const [filteredSearch, setFilteredSearch] = useState<any[]>([...search]);
	useEffect(() => {
		const timerId = setTimeout(() => {
			dispatch(channelActions.getUpdateSearch());
		}, 0);
		return () => clearTimeout(timerId);
	}, []);

	useEffect(() => {
		if (search?.length > 0) {
			// console.log('array: ', search);
			// console.log('must be sorted array: ', search.sort(compareNames));
		}
	}, [search]);

	const onChange = (e: ChangeEvent<HTMLInputElement>) => {
		const name = e.currentTarget.value;
		const filterSearch = (item: any) => {
			const itemName = item.name.toLowerCase();
			return itemName.includes(name.toLowerCase());
		}
		setFilteredSearch([...search.filter(filterSearch)]);
	}

	return (
		<div className={styles['list']} >
			<div className={styles['control-row']}>
				<div className={styles['search']}>
					<Search className={styles['search']} placeholder='Search' onChange={onChange}/>
				</div>
			</div>
			{filteredSearch?.map((c: any) => (
				c.tag.includes('user')
				? <CardNavLink
					to={`/Search/user/${c.id}`}
					className={classNames(styles['preview-button'])}
					key={c.key}
					onClick={() => {
						setActive(c.key);
						dispatch(getUserProfile(c.id));
					}}>
					<SearchPreview data={c} />
					</CardNavLink>
				: <CardNavLink
					to={`/Search/channel/${c.id}`}
					className={classNames(styles['preview-button'])}
					key={c.key}
					onClick={() => {
						setChannel(c);
						setActive(c.key);
						dispatch(channelActions.setSelectedChannel({ channel: c }));
						dispatch(channelActions.getMessages(c.id));
					}}>
					<SearchPreview
						data={c}
					/>
				</CardNavLink>
			))}
		</div>
	);
}