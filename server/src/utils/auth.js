const jwt = require('jsonwebtoken');

function getTokenPayload(token) {
    return jwt.verify(token, process.env.TOKEN_KEY);
}

const getUserId = (req, authToken) => {
    try {
        if (req) {
            const authHeader = req.headers.authorization;
            if (authHeader) {
                const token = authHeader.replace('Bearer ', '');
                if (!token) {
                    throw new Error('No token found');
                }
                const { userId } = getTokenPayload(token);
                return userId;
            }
        } else if (authToken) {
            const { userId } = getTokenPayload(authToken);
            return userId;
        }
    } catch (e) {
        throw new Error('Not authenticated');
    }
}


module.exports = {
    getUserId
};