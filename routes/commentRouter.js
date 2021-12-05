const Router = require('express')
const router = new Router()
const commentController = require('../controllers/commentController')
const checkRole = require('../middleware/checkRoleMiddleware')

router.post('/', commentController.create)
router.get('/', commentController.getAll)
router.delete('/', commentController.delete)
router.get('/:id', commentController.getOne)

module.exports = router