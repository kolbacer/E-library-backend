const jwt = require('jsonwebtoken')
const {User} = require('../models/models')

module.exports = function() {
    return async function (req, res, next) {
        if (req.method === "OPTIONS") {
            next()
        }
        try {
            const token = req.headers.authorization.split(' ')[1] // Bearer [token]
            if (!token) {
                res.status(401).json({message: "Не авторизован"})
            }
            const decoded = jwt.verify(token, process.env.SECRET_KEY)
            let user = await User.findOne({where: {user_id: decoded.user_id}})
            if (!(user.is_moder || user.is_author))
            {
                return res.status(403).json({message: "Нет доступа"})
            }
            req.user = decoded
            next()
        } catch(e) {
            res.status(401).json({message: "Пользователь не авторизован"})
        }
    };
}