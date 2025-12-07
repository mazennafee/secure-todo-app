// backend/src/middleware/rbac.js
// Role-Based Access Control middleware

export const ROLES = {
    ADMIN: 'admin',
    USER: 'user'
};

export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Get user role (should be attached by authenticateToken middleware)
        const userRole = req.user.role || ROLES.USER;

        // Check if user has allowed role
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                required: allowedRoles,
                current: userRole
            });
        }

        next();
    };
};

// Admin-only middleware
export const requireAdmin = requireRole([ROLES.ADMIN]);

// Convenience middleware for common combinations
export const requireAdminOrOwner = (ownerIdField = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userRole = req.user.role || ROLES.USER;
        const isAdmin = userRole === ROLES.ADMIN;
        const isOwner = req.user.userId === req[ownerIdField] ||
            req.user.userId === req.params[ownerIdField] ||
            req.user.userId === req.body[ownerIdField];

        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                error: 'Access denied. Must be admin or owner.'
            });
        }

        req.isAdmin = isAdmin;
        next();
    };
};
