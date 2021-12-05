const jwt = require('jsonwebtoken')
const {User} = require('../models/models')

module.exports = function(role) {
    return async function (req, res, next) { // not async
        if (req.method === "OPTIONS") {
            next()
        }
        try {
            const token = req.headers.authorization.split(' ')[1] // Bearer dsfsgfdfgdg
            if (!token) {
                res.status(401).json({message: "Не авторизован"})
            }
            const decoded = jwt.verify(token, process.env.SECRET_KEY)
            let user = await User.findOne({where: {user_id: decoded.user_id}}) // delete await
            if (!(((role === "author") && (user.is_author)) ||
                ((role === "moder") && (user.is_moder))))
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