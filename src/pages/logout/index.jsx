import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';

const Logout = () => {
	const navigate = useNavigate();

	useEffect(() => {
		localStorage.removeItem('access_token');
		localStorage.removeItem('refresh_token');
		localStorage.removeItem('token_expires');
		localStorage.removeItem('id_token');
		// 重定向到首页或之前的页面
		const returnUrl = sessionStorage.getItem('returnUrl') || '/';
		sessionStorage.removeItem('returnUrl');
		window.open(returnUrl,"_self");
	}, []);

	return (
		<div style={{
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
            width: '100vw',
			height: '100vh'
		}}>
			<Spin size="large" tip="登出中..." />
		</div>
	);
};

export default Logout;
