const jwt = require('jsonwebtoken')
const {User} = require("../models/models");

module.exports = async function checkPersonality(user_id, token) {
    const decoded = jwt.verify(token, process.env.SECRET_KEY)
    let user = await User.findOne({where: {user_id: decoded.user_id}})

    if (!((user_id === user.user_id) || (user.is_moder))) {
        throw {status: 403, message: "Нет доступа!"}
    }
}