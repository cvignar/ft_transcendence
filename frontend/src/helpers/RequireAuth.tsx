import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../store/store';


export const RequireAuth = ({ children }: { children: ReactNode }) => {

	const token = useSelector((s: RootState) => s.user.token);
	if (!token) {
		return <Navigate to='/Auth' replace />;
	}
	return <>{children}</>;
};