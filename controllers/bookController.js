const {Book, Rating} = require('../models/models')
const ApiError = require('../error/ApiError')
const {BookAuthor} = require("../models/models");
const {BookReader} = require("../models/models");

const checkPersonality = require('../utils/checkPersonality')

class BookController {
    async create(req, res, next) {
        try{
            const obj = req.body

            if (req.files && req.files.img) {
                obj.imgdata = req.files.img.data
            }

            if (req.files && req.files.file) {
                const {file} = req.files

                let tempArray = file.name.split('.')
                let fileFormat = 'txt'
                if (tempArray.length > 1) {
                    fileFormat = tempArray[tempArray.length - 1]
                }

                //obj.download_link = path.resolve(__dirname, '..', 'static/books', fileName)
                obj.file_format = fileFormat
                obj.filedata = req.files.file.data
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
                attributes: [
                    "book_id",
                    "title",
                    "authors",
                    "genre",
                    "publisher",
                    "publication_date",
                    "age_rating",
                    "language",
                    "description",
                    "pages_amount",
                    "file_format",
                    "download_link",
                    "approved",
                    "imgdata",
                ],
                limit,
                offset
            })
        } else {
            books = await Book.findAndCountAll({
                where: {
                    title,
                    approved: true
                },
                attributes: [
                    "book_id",
                    "title",
                    "authors",
                    "genre",
                    "publisher",
                    "publication_date",
                    "age_rating",
                    "language",
                    "description",
                    "pages_amount",
                    "file_format",
                    "download_link",
                    "approved",
                    "imgdata",
                ],
                limit,
                offset
            })
        }

        books.rows.map(book => {
            if (book.imgdata) {
                const stringified_image = book.imgdata.toString('base64')
                book['imgdata'] = stringified_image
            }
        })

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
                attributes: [
                    "book_id",
                    "title",
                    "authors",
                    "genre",
                    "publisher",
                    "publication_date",
                    "age_rating",
                    "language",
                    "description",
                    "pages_amount",
                    "file_format",
                    "download_link",
                    "approved",
                    "imgdata",
                ],
                limit,
                offset
            })

            books.rows.map(book => {
                if (book.imgdata) {
                    const stringified_image = book.imgdata.toString('base64')
                    book['imgdata'] = stringified_image
                }
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

        if (book && book.imgdata) {
            const stringified_image = book.imgdata.toString('base64')
            book['imgdata'] = stringified_image
        }
        if (book && book.filedata) {
            const stringified_file = book.filedata.toString('base64')
            book['filedata'] = stringified_file
        }

        return res.json(book)
    }

    async rate(req, res) {
        try {
            const obj = req.body
            checkPersonality(obj.user_id, req.headers.authorization.split(' ')[1])
            const rate = await Rating.create(obj)
            return res.json(rate)
        } catch (e) {
            return res.status(520).json(e.message)
        }
    }

    async deleteRate(req, res, next) {
        try{
            const {user_id, book_id} = req.query
            checkPersonality(user_id, req.headers.authorization.split(' ')[1])
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
        try {
            const {user_id, book_id} = req.body
            checkPersonality(user_id, req.headers.authorization.split(' ')[1])
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
            checkPersonality(user_id, req.headers.authorization.split(' ')[1])
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
        try {
            const {user_id, book_id} = req.body
            checkPersonality(user_id, req.headers.authorization.split(' ')[1])
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
        try {
            const {user_id, book_id, bookmark} = req.body
            checkPersonality(user_id, req.headers.authorization.split(' ')[1])
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
        checkPersonality(user_id, req.headers.authorization.split(' ')[1])
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