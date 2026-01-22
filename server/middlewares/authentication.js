const { verifyToken } = require('../helpers/jwt');
const { User } = require('../models');

async function authentication(req, res, next) {
    try {
        // 1. Check if the Authorization header is present
        const { authorization } = req.headers;
        if (!authorization) {
            throw { name: "Unauthenticated" };
        }

        // 2. Expect the format "Bearer <token>"
        const token = authorization.split(" ")[1];
        if (!token) throw { name: "Unauthenticated" };

        // 3. Verify token
        const payload = verifyToken(token);

        // 4. Check whether the user who owns the token still exists in the database
        const user = await User.findByPk(payload.id);
        if (!user) {
            throw { name: "Unauthenticated" };
        }

        // 5. Store user data in req
        req.user = {
            id: user.id,
            email: user.email
        };

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = authentication;