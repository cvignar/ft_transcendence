import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState } from '../store/store';
import { getCookie } from 'typescript-cookie'


export const RequireAuth = ({ children }: { children: ReactNode }) => {

	const access_token : string | undefined = getCookie('accessToken');
	const twoFA : string | undefined = getCookie('twoFA');
	const location = useLocation();
	if (!access_token) {
		if (twoFA === 'true') {
			return <Navigate to='/Auth/2FA' replace />;
		}
		return <Navigate to='/Auth' replace />;
	}
	if (location.pathname === '/') {
		return <Navigate to='/Settings/Stats' replace />;
	}
	return <>{children}</>;
};