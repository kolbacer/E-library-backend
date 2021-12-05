const {Book, Rating} = require('../models/models')
const ApiError = require('../error/ApiError')
const uuid = require('uuid')
const path = require('path')
const {BookAuthor} = require("../models/models");
const {BookReader} = require("../models/models");
const {unlink} = require('fs')

class BookController {
    async create(req, res, next) {
        try{
            const obj = req.body

            if (req.files && req.files.img) {
                const {img} = req.files

                let tempArray = img.name.split('.')
                let imgFormat = 'jpg'
                if (tempArray.length > 1) {
                    imgFormat = tempArray[tempArray.length - 1]
                }

                let imgName = uuid.v4() + "." + imgFormat
                obj.img = imgName
                img.mv(path.resolve(__dirname, '..', 'static/images', imgName))
            }

            if (req.files && req.files.img) {
                const {file} = req.files

                let tempArray = file.name.split('.')
                let fileFormat = 'txt'
                if (tempArray.length > 1) {
                    fileFormat = tempArray[tempArray.length - 1]
                }

                let fileName = uuid.v4() + "." + fileFormat
                obj.file = fileName
                file.mv(path.resolve(__dirname, '..', 'static/books', fileName))

                obj.download_link = path.resolve(__dirname, '..', 'static/books', fileName)
                obj.file_format = fileFormat
            }

            const book = await Book.create(obj).then().catch(e => {
                console.log(e)
            })
            return res.json(book)
        } catch (e) {
           next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res) {
        let {title, limit, page} = req.query
        page = page || 1
        limit = limit || 10
        let offset = page * limit - limit
        let books;
        if (!title) {
            books = await Book.findAndCountAll({
                where: {
                    approved: true
                },
                limit,
                offset
            })
        } else {
            books = await Book.findAndCountAll({
                where: {
                    title,
                    approved: true
                },
                limit,
                offset
            })
        }

        return res.json(books)
    }

    async getByAttribute(req, res) {
        const {text, attribute, page, limit} = req.body
        let offset = page * limit - limit
        let whereObj = {}
        whereObj[attribute] = text
        whereObj = {...whereObj, approved: true}
        try {
            const books = await Book.findAndCountAll({
                where: whereObj,
                limit,
                offset
            })
            return res.json(books)
        } catch (e) {
            return res.status(520).json(e.message)
        }
    }

    async getOne(req, res) {
        const book_id = req.params.id
        const book = await Book.findOne(
            {
                where: {book_id},
            },
        )
        return res.json(book)
    }

    async rate(req, res) {
        try {
            const obj = req.body
            const rate = await Rating.create(obj)
            return res.json(rate)
        } catch (e) {
            return res.status(520).json(e.message)
        }
    }

    async deleteRate(req, res, next) {
        try{
            const {user_id, book_id} = req.query
            const response = await Rating.destroy({
                where: {user_id, book_id}
            })
            return res.json(response)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getRate(req, res) {
        const {user_id, book_id} = req.query
        const rate = await Rating.findOne(
            {
                where: {user_id, book_id},
                attributes: ["rate"]
            },
        )
        return res.json(rate)
    }

    async getRating(req, res) {
        const {book_id} = req.query
        const rates = await Rating.findAll(
            {
                where: {book_id},
                attributes: ["rate"]
            },
        )
        let sum_of_rates = 0
        let num_of_rates = rates.length
        for (let i = 0; i < num_of_rates; ++i) {
            sum_of_rates += rates[i].rate
        }
        let rating = sum_of_rates / num_of_rates

        return res.json(rating)
    }

    async checkRent(req, res) {
        const {user_id, book_id} = req.query
        const rent = await BookReader.findOne(
            {
                where: {user_id, book_id},
            },
        )

        return res.json(rent)
    }

    async makeRent(req, res) {
        const {user_id, book_id} = req.body
        try {
            const rent = await BookReader.create({
                user_id,
                book_id,
                bookmark: 0
            })
            return res.json(rent)
        } catch (e) {
            return res.status(520).json(e.message)
        }
    }

    async deleteRent(req, res) {
        try{
            const {user_id, book_id} = req.query
            const response = await BookReader.destroy({
                where: {user_id, book_id}
            })
            return res.json(response)
        } catch (e) {
            return res.status(520).json(e.message)
        }
    }

    async approveBook(req, res) {
        const {book_id} = req.body
        try {
            const response = await Book.update(
                {approved: true},
                {where: {book_id}})
            return res.json(response)
        } catch (e) {
            return res.status(520).json(e.message)
        }
    }

    async delete(req, res) {
        try{
            const {book_id} = req.query

            const book = await Book.findOne({ where: {book_id} })

            if (book.img) {
                const imgName = path.resolve(__dirname, '..', 'static/images', book.img)
                unlink(imgName, (err) => {
                    if (err) console.log('не удалось удалить картинку');
                    console.log(imgName + ' was deleted');
                });
            }

            if (book.file) {
                const fileName = path.resolve(__dirname, '..', 'static/books', book.file)
                unlink(fileName, (err) => {
                    if (err) console.log('не удалось удалить книгу');
                    console.log(fileName + ' was deleted');
                });
            }

            const response = await Book.destroy({
                where: {book_id}
            })

            return res.json(response)
        } catch (e) {
            return res.status(520).json(e.message)
        }
    }

    async getBooksToApprove(req, res) {
        const books = await Book.findAll({
            where:{approved: false},
            attributes: ["book_id", "title", "authors"]
        })

        return res.json(books)
    }

    async makeAuthorship(req, res) {
        const {user_id, book_id} = req.body
        try {
            const authorship = await BookAuthor.create({
                user_id,
                book_id
            })
            return res.json(authorship)
        } catch (e) {
            return res.status(520).json(e.message)
        }
    }

    async makeBookmark(req, res) {
        const {user_id, book_id, bookmark} = req.body
        try {
            const response = await BookReader.update(
                {bookmark},
                {where: {user_id, book_id}})
            return res.json(response)
        } catch (e) {
            return res.status(520).json(e.message)
        }
    }

    async getBookmark(req, res) {
        const {user_id, book_id} = req.query
        const bookmark = await BookReader.findOne(
            {
                where: {user_id, book_id},
                attributes: ["bookmark"]
            },
        )
        return res.json(bookmark)
    }

}

module.exports = new BookController()