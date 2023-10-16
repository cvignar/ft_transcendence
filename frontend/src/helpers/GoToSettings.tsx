import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../store/store';
import { getCookie } from 'typescript-cookie'


export const GoToSettings = ({ children }: { children: ReactNode }) => {

	const user = useSelector((s: RootState) => s.user);
	const access_token : string | undefined = getCookie('accessToken');

	if (access_token && user.profile) {
		return <Navigate to='/Settings/Stats' replace />;
	}
	return <>{children}</>;
};