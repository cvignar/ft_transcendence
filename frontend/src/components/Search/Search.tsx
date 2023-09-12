import { forwardRef } from 'react';
import styles from './Search.module.css';
import classNames from 'classnames';
import { SearchProps } from './Search.props';

const Search = forwardRef<HTMLInputElement, SearchProps>(function Input({ className, isValid = true, ...props }, ref) {
	return (
		<div className={styles['input-wrapper']}>
			<input {...props} ref={ref} name={props.name} className={classNames(styles['input'], className, {
				[styles['invalid']]: !isValid
			})} />
			<img className={styles['icon']} src='/search.svg' alt='search icon'/>
		</div>
	);
});

export default Search; 