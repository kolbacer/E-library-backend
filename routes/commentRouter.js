const Router = require('express')
const router = new Router()
const commentController = require('../controllers/commentController')
const authMiddleware = require("../middleware/authMiddleware");

router.post('/', authMiddleware, commentController.create)
router.get('/', commentController.getAll)
router.delete('/', authMiddleware, commentController.delete)
router.get('/:id', commentController.getOne)

module.exports = router