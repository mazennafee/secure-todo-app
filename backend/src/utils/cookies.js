// backend/src/utils/cookies.js
// Utility functions for secure cookie management

export const cookieConfig = {
    httpOnly: true,  // Prevent JavaScript access
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
    sameSite: 'strict',  // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
};

export const accessTokenConfig = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000  // 15 minutes
};

export const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie('accessToken', accessToken, accessTokenConfig);
    res.cookie('refreshToken', refreshToken, cookieConfig);
};

export const clearAuthCookies = (res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
};
