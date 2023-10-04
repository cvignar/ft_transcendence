import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../store/store';
import { getCookie } from 'typescript-cookie'


export const RequireAuth = ({ children }: { children: ReactNode }) => {

	// const token = useSelector((s: RootState) => s.user.token);
	const access_token : string | undefined = getCookie('accessToken')
	console.log('access_token: ', access_token);
	if (!access_token) {
		return <Navigate to='/Auth' replace />;
	}	
	return <>{children}</>;
};