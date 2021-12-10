const jwt = require('jsonwebtoken')

module.exports = function checkPersonality(user_id, token) {
    const decoded = jwt.verify(token, process.env.SECRET_KEY)
    if (user_id !== decoded.user_id) {
        throw {status: 403, message: "Нет доступа!"}
    }
}