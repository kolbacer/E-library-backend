const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt')
const {Book, User} = require("../models/models");
const uuid = require('uuid')
const path = require('path')
const jwt = require('jsonwebtoken')

const generateJwt = (user_id, login) => {
     return jwt.sign(
        {user_id, login},
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    )
}

class UserController {
    async registration(req, res, next) {
        const {login, password} = req.body
        if (!login || !password) {
            return next(ApiError.badRequest('Некорректный login или password'))
        }
        const candidate = await User.findOne({where: {login}})
        if (candidate) {
            return next(ApiError.badRequest('Пользователь с таким login уже существует'))
        }
        const hashPassword = await bcrypt.hash(password, 5)

        let obj = req.body
        obj.password = hashPassword

        if (req.files) {
            const {img} = req.files
            let tempArray = img.name.split('.')
            let imgFormat = 'jpg'
            if (tempArray.length > 1) {
                imgFormat = tempArray[tempArray.length - 1]
            }

            let imgName = uuid.v4() + "." + imgFormat
            obj.img = imgName
            img.mv(path.resolve(__dirname, '..', 'static/user_images', imgName))
        }

        const user = await User.create(obj)
        const token = generateJwt(user.user_id, user.login)
        return res.json({token})
    }

    async login(req, res, next) {
        const {login, password} = req.body
        const user = await User.findOne({where: {login}})
        if (!user) {
            return next(ApiError.internal('Пользователь не найден'))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            return next(ApiError.internal('Неверный пароль'))
        }
        const token = generateJwt(user.user_id, user.login)
        return res.json({token, user_id: user.user_id, is_author: user.is_author, is_moder: user.is_moder})
    }

    async check(req, res, next) {
        const user = await User.findOne({where: {login: req.user.login}})
        if (!user) {
            return next(ApiError.internal('Пользователь не найден'))
        }
        const token = generateJwt(req.user.user_id, req.user.login)
        return res.json({token, user_id: user.user_id, is_author: user.is_author, is_moder: user.is_moder})
    }

    async getAll(req, res) {
        let {title, limit, page} = req.query
        page = page || 1
        limit = limit || 10
        let offset = page * limit - limit
        let books;
        if (!title) {
            books = await User.findAndCountAll({limit, offset})
        } else {
            books = await User.findAndCountAll({where:{title}, limit, offset})
        }

        return res.json(books)
    }

    async getOne(req, res) {
        const user_id = req.params.id
        const user = await User.findOne(
            {
                where: {user_id},
            },
        )
        return res.json(user)
    }
/*
    async findByLogin(req, res, next) {
        const login = req.body.login
        const users = await User.findAll(
            {
                where: {login},
                attributes: ["user_id", "name", "is_author", "is_moder"]
            },
        )
        if ((typeof users == 'undefined') || (users.length === 0)) {
            //return next(ApiError.badRequest('Пользователь не найден!'))
            //throw {status: 500, message: "Пользователь не найден!"}
            return res.status(404).json('Пользователь не найден!')
        }

        return res.json(users)
    }
*/
    async findById(req, res, next) {
        const user_id = req.body.user_id
        try {
            const users = await User.findAll(
                {
                    where: {user_id},
                    attributes: ["user_id", "name", "is_author", "is_moder"]
                },
            )
            if ((typeof users == 'undefined') || (users.length === 0)) {
                //return next(ApiError.badRequest('Пользователь не найден!'))
                return res.status(404).json('Пользователь не найден!')
            }

            return res.json(users)
        } catch (e) {
            return res.status(520).json(e.message)
        }
    }

    async findByName(req, res, next) {
        const name = req.body.name
        try {
            const users = await User.findAll(
                {
                    where: {name},
                    attributes: ["user_id", "name", "is_author", "is_moder"]
                },
            )
            if ((typeof users == 'undefined') || (users.length === 0)) {
                //return next(ApiError.badRequest('Пользователь не найден!'))
                return res.status(404).json('Пользователь не найден!')
            }

            return res.json(users)
        } catch (e) {
            return res.status(520).json(e.message)
        }
    }

    async getReaderBooks(req, res, next) {
        try {
            const {user_id} = req.query

            const books = await User.findAll(
                {
                    attributes: [],
                    where: {
                      user_id
                    },
                    include: {
                        attributes: ["book_id", "title", "authors"],
                        model: Book,
                        as: 'BookReader',
                        through: {attributes: ["bookmark"]},
                    },
                    //raw: true
                }
            )

            return res.json(books[0].BookReader)
        } catch (e) {
            return res.status(520).json(e.message)
        }
    }

    async getAuthorBooks(req, res, next) {
        try {
            const {user_id} = req.query

            const books = await User.findAll(
                {
                    attributes: [],
                    where: {
                        user_id
                    },
                    include: {
                        attributes: ["book_id", "title", "authors"],
                        model: Book,
                        as: 'BookAuthor',
                        through: {attributes: []},
                    },
                    //raw: true
                }
            )

            return res.json(books[0].BookAuthor)
        } catch (e) {
            return res.status(520).json(e.message)
        }
    }

    async changeRole(req, res) {
        const {user_id, is_author, is_moder} = req.body
        let toUpdate = {}
        if (!(is_author === undefined)) {
            toUpdate = {...toUpdate,
                is_author
            }
        }
        if (!(is_moder === undefined)) {
            toUpdate = {...toUpdate,
                is_moder
            }
        }
        if (is_author) {
            toUpdate = {...toUpdate,
                author_request: false
            }
        }

        try {
            const response = await User.update(
                toUpdate,
                {where: {user_id}})
            return res.json(response)
        } catch (e) {
            return res.status(520).json(e.message)
        }
    }

    async setAuthorRequest(req, res) {
        const {user_id} = req.body
        try {
            const response = await User.update(
                {author_request: true},
                {where: {user_id}})
            return res.json(response)
        } catch (e) {
            return res.status(520).json(e.message)
        }
    }

    async rejectAuthor(req, res) {
        const {user_id} = req.body
        try {
            const response = await User.update(
                {author_request: false},
                {where: {user_id}})
            return res.json(response)
        } catch (e) {
            return res.status(520).json(e.message)
        }
    }

    async changePassword(req, res, next) {
        const {user_id, old_password, new_password} = req.body

        const user = await User.findOne({where: {user_id}})
        let comparePassword = bcrypt.compareSync(old_password, user.password)
        if (!comparePassword) {
            return next(ApiError.internal('Неверный старый пароль'))
        }

        if (!new_password) {
            return next(ApiError.badRequest('Некорректный новый пароль'))
        }
        const hashPassword = await bcrypt.hash(new_password, 5)

        const response = await User.update(
            {password: hashPassword},
            {where: {user_id}})

        const token = generateJwt(user.user_id, user.login)
        return res.json({token})
    }

    async getAuthorRequests(req, res) {
        const users = await User.findAll({
            where:{author_request: true},
            attributes: ["user_id", "name"]
        })

        return res.json(users)
    }

}
module.exports = new UserController()