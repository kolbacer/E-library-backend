const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get('/auth', authMiddleware, userController.check)
// router.post('/getbylogin', userController.findByLogin)
router.post('/getbyid', userController.findById)
router.post('/getbyname', userController.findByName)
router.get('/getreaderbooks', userController.getReaderBooks)
router.get('/getauthorbooks', userController.getAuthorBooks)
router.put('/changerole', userController.changeRole)
router.put('/authorrequest', userController.setAuthorRequest)
router.put('/rejectauthor', userController.rejectAuthor)
router.put('/changepassword', userController.changePassword)
router.get('/authorrequests', userController.getAuthorRequests)

router.get('/', userController.getAll)
router.get('/:id', userController.getOne)

module.exports = router