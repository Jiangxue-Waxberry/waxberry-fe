import { AUTH_CONFIG } from '@/config/auth.config';
import { message } from 'antd';

class AuthService {
	generateRandomString(length) {
		try {
			const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			let result = '';
			const randomValues = new Uint8Array(length);
			window.crypto.getRandomValues(randomValues);
			for (let i = 0; i < length; i++) {
				result += charset[randomValues[i] % charset.length];
			}
			return result;
		} catch (error) {
			console.error('Failed to generate random string:', error);
			message.error('安全随机数生成失败');
			throw error;
		}
	}

	base64URLEncode(str) {
		const base64 = btoa(str);
		return base64
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=/g, '');
	}

	generateCodeVerifier() {
		return this.generateRandomString(43);
	}

	generateCodeChallenge(verifier) {
		if (!window.sha256) {
			console.error('SHA-256 library not loaded');
			message.error('加密库加载失败');
			throw new Error('SHA-256 library not loaded');
		}

		try {
			const hash = window.sha256(verifier);
			const binaryStr = hash.match(/.{2}/g)
				.map(byte => String.fromCharCode(parseInt(byte, 16)))
				.join('');
			return this.base64URLEncode(binaryStr);
		} catch (error) {
			console.error('Failed to generate code challenge:', error);
			message.error('验证码生成失败');
			throw error;
		}
	}

	login = (url) => {
		try {
			// 验证必要的配置
			if (!AUTH_CONFIG.clientId || !AUTH_CONFIG.authEndpoint) {
				throw new Error('Invalid auth configuration');
			}

			const codeVerifier = this.generateCodeVerifier();
			const codeChallenge = this.generateCodeChallenge(codeVerifier);

			// 存储 code_verifier 时添加过期时间
			const verifierData = {
				value: codeVerifier,
				expires: Date.now() + 5 * 60 * 1000 // 5分钟过期
			};
			sessionStorage.setItem('code_verifier', JSON.stringify(verifierData));

			const params = new URLSearchParams({
				response_type: 'code',
				client_id: AUTH_CONFIG.clientId,
				redirect_uri: AUTH_CONFIG.redirectUri,
				code_challenge: codeChallenge,
				code_challenge_method: 'S256',
				scope: AUTH_CONFIG.scope,
				state: this.generateRandomString(16) // 添加 state 参数防止 CSRF
			});
			sessionStorage.setItem('returnUrl', url || window.location.pathname+window.location.search);
			window.location.href = `${AUTH_CONFIG.authEndpoint}?${params}`;
		} catch (error) {
			console.error('Login error:', error);
			message.error('登录失败，请稍后重试');
		}
	}

	handleCallback = async (code) => {
		try {
			const storedVerifierData = sessionStorage.getItem('code_verifier');
			if (!storedVerifierData) {
				throw new Error('No code verifier found');
			}

			const { value: codeVerifier, expires } = JSON.parse(storedVerifierData);

			// 检查是否过期
			if (Date.now() > expires) {
				throw new Error('Code verifier expired');
			}

			const response = await fetch(AUTH_CONFIG.tokenEndpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: new URLSearchParams({
					grant_type: 'authorization_code',
					client_id: AUTH_CONFIG.clientId,
					code_verifier: codeVerifier,
					code: code,
					redirect_uri: AUTH_CONFIG.redirectUri
				})
			});

			if (!response.ok) {
				throw new Error('Token exchange failed');
			}

			const tokens = await response.json();

			// 存储 tokens
			this.storeTokens(tokens);

			// 清理 verifier
			sessionStorage.removeItem('code_verifier');

			return tokens;
		} catch (error) {
			console.error('Token exchange error:', error);
			message.error('认证失败，请重新登录');
			throw error;
		}
	}

	storeTokens(tokens) {
		if (tokens.access_token) {
			localStorage.setItem('access_token', tokens.access_token);
		}
		if (tokens.refresh_token) {
			localStorage.setItem('refresh_token', tokens.refresh_token);
		}
		if (tokens.expires_in) {
			localStorage.setItem('token_expires', String(Date.now() + tokens.expires_in * 1000));
		}
		if(tokens.id_token){
			localStorage.setItem('id_token', tokens.id_token);
		}
	}

	isAuthenticated() {
		// 检查 是否登出页
		if(window.location.pathname.indexOf("logout") !== -1) return false;

		const token = localStorage.getItem('access_token');
		const expires = localStorage.getItem('token_expires');

		if (!token || !expires) return false;

		// 检查是否过期
		return Date.now() < parseInt(expires);
	}

	logout() {
		let idToken = localStorage.getItem('id_token');

		const logoutUrl = new URL(AUTH_CONFIG.logoutEndpoint);
		logoutUrl.searchParams.append('client_id', AUTH_CONFIG.clientId);
		logoutUrl.searchParams.append('post_logout_redirect_uri', AUTH_CONFIG.postLogoutRedirectUri);
		logoutUrl.searchParams.append('state', this.generateRandomString(16));

		if (idToken) {
			logoutUrl.searchParams.append('id_token_hint', idToken);
		}
		sessionStorage.setItem('returnUrl', window.location.pathname+window.location.search);
		window.location.href = logoutUrl.toString();
	}
}

export const authService = new AuthService();
