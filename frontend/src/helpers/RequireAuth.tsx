import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../store/store';
export const RequireAuth = ({ children }: { children: ReactNode }) => {
	const id42 = useSelector((s: RootState) => s.user.id42);

	if (!id42) {
		return <Navigate to='/' replace />;
	}
	return <>{children}</>;
};