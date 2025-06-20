import Cookies from 'js-cookie';

export const cookieService = {
    setAccessToken(token: string, expiryDays: number = 1) {
        Cookies.set('access_token', token, { expires: expiryDays, path: '/' });
    },

    getAccessToken(): string | undefined {
        return Cookies.get('access_token');
    },

    removeAccessToken() {
        Cookies.remove('access_token', { path: '/' });
    },

    setRefreshToken(token: string, expiryDays: number = 7) {
        Cookies.set('refresh_token', token, { expires: expiryDays, path: '/' });
    },

    getRefreshToken(): string | undefined {
        return Cookies.get('refresh_token');
    },

    removeRefreshToken() {
        Cookies.remove('refresh_token', { path: '/' });
    },
};
