import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../store/store';
import { getCookie } from 'typescript-cookie'


export const RequireAuth = ({ children }: { children: ReactNode }) => {

	const access_token : string | undefined = getCookie('accessToken')
	// const user_id : string | undefined = getCookie('userId')
	if (!access_token) {
		return <Navigate to= '/Auth' replace />;
	}
	// else if (access_token && user_id) {
	// 	return <Navigate to='/Auth' replace />;
	// }	
	return <>{children}</>;
};