// backend/src/routes/auth.js
// POST /api/auth/logout - Logout and revoke refresh token
router.post('/logout', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            // Revoke the refresh token
            await RefreshTokenModel.revoke(refreshToken);
        }

        res.json({ message: 'Logged out successfully' });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

export default router;
