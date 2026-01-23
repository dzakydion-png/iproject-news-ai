const { verifyToken } = require('../helpers/jwt');
const { User } = require('../models');

async function authentication(req, res, next) {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            throw { name: "Unauthenticated" };
        }

        const [type, token] = authorization.split(" ");

        if (type !== 'Bearer' || !token) {
            throw { name: "Unauthenticated" };
        }

        const payload = verifyToken(token);

        const user = await User.findByPk(payload.id);
        if (!user) {
            throw { name: "Unauthenticated" };
        }

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