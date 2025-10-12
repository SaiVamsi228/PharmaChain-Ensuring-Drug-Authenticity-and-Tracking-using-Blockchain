const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = (roles = []) => {
    return async (req, res, next) => {
        try {
            // Get token from header
            const token = req.header('Authorization')?.replace('Bearer ', '');
            
            if (!token) {
                return res.status(401).json({ 
                    error: 'Authentication required. No token provided.' 
                });
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Find user by wallet address
            const user = await User.findOne({ 
                walletAddress: decoded.walletAddress 
            });

            if (!user) {
                return res.status(401).json({ 
                    error: 'Invalid token. User not found.' 
                });
            }

            // Check if user's role is authorized
            if (roles.length && !roles.includes(user.role)) {
                return res.status(403).json({ 
                    error: `Access denied. Required roles: ${roles.join(', ')}` 
                });
            }

            // Attach user to request
            req.user = user;
            req.token = token;

            // Update last login
            await user.updateLastLogin();

            next();
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    error: 'Invalid token. Please authenticate.' 
                });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    error: 'Token expired. Please login again.' 
                });
            }
            res.status(500).json({ 
                error: 'Authentication error', 
                details: error.message 
            });
        }
    };
};

module.exports = auth; 