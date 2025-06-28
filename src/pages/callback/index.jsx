import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@services/authService';
import { Spin } from 'antd';

const Callback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // 获取授权码
                const code = searchParams.get('code');
                if (!code) {
                    throw new Error('No code provided');
                }
                // 交换 token
                const tokens = await authService.handleCallback(code);
                // 更新登录状态
                if (tokens.access_token) {
                    // 重定向到首页或之前的页面
                    let returnUrl = sessionStorage.getItem('returnUrl') || '/index';
                    sessionStorage.removeItem('returnUrl');
                    window.open(returnUrl,"_self");
                }
            } catch (error) {
                console.error('Authentication error:', error);
                // 登录失败
                window.open("/","_self");
            }
        };

        handleCallback();
    }, []);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
            height: '100vh'
        }}>
            <Spin size="large" tip="认证中..." />
        </div>
    );
};

export default Callback;
