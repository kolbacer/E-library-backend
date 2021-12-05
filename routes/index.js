const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const bookRouter = require('./bookRouter')
const commentRouter = require('./commentRouter')

router.use('/user', userRouter)
router.use('/book', bookRouter)
router.use('/comment', commentRouter)

module.exports = router