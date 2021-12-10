const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    user_id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4, allowNull: false},
    login: {type: DataTypes.STRING, unique: true, allowNull: false},
    password: {type: DataTypes.STRING, allowNull: false},
    name: {type: DataTypes.STRING, allowNull: false},
    birth_date: {type: DataTypes.DATE, allowNull: false},
    about: {type: DataTypes.STRING, allowNull: true},
    is_author: {type: DataTypes.BOOLEAN, allowNull: false},
    is_moder: {type: DataTypes.BOOLEAN, allowNull: false},
    author_request: {type: DataTypes.BOOLEAN, allowNull: true},
    imgdata: {type: DataTypes.BLOB('long'), allowNull: true}
}, {
    freezeTableName: true,
    timestamps: false
})

const Book = sequelize.define('book', {
    book_id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4, allowNull: false},
    title: {type: DataTypes.STRING, allowNull: false},
    authors: {type: DataTypes.STRING, allowNull: true},
    genre: {type: DataTypes.STRING, allowNull: false},
    publisher: {type: DataTypes.STRING, allowNull: true},
    publication_date: {type: DataTypes.DATE, allowNull: false},
    age_rating: {type: DataTypes.INTEGER, allowNull: true},
    language: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: true},
    pages_amount: {type: DataTypes.INTEGER, allowNull: true},
    file_format: {type: DataTypes.STRING, allowNull: true},
    download_link: {type: DataTypes.STRING, allowNull: true},
    approved: {type: DataTypes.BOOLEAN, allowNull: false},
    imgdata: {type: DataTypes.BLOB('long'), allowNull: true},
    filedata: {type: DataTypes.BLOB('long'), allowNull: true}
}, {
    freezeTableName: true,
    timestamps: false
})

const BookAuthor = sequelize.define('book_author', {
    book_id: {type: DataTypes.UUID, allowNull: false, references: {model: Book, key: 'book_id'}},
    user_id: {type: DataTypes.UUID, allowNull: false, references: {model: User, key: 'user_id'}}
}, {
    freezeTableName: true,
    timestamps: false
})

const BookReader = sequelize.define('book_reader', {
    book_id: {type: DataTypes.UUID, allowNull: false, references: {model: Book, key: 'book_id'}},
    user_id: {type: DataTypes.UUID, allowNull: false, references: {model: User, key: 'user_id'}},
    bookmark: {type: DataTypes.INTEGER, allowNull: true}
}, {
    freezeTableName: true,
    timestamps: false
})

const Comments = sequelize.define('comments', {
    comment_id: {type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4, allowNull: false},
    book_id: {type: DataTypes.UUID, allowNull: false, references: {model: Book, key: 'book_id'}},
    user_id: {type: DataTypes.UUID, allowNull: false, references: {model: User, key: 'user_id'}},
    comment: {type: DataTypes.STRING, allowNull: false},
    time: {type: DataTypes.DATE(0), allowNull: true}
}, {
    freezeTableName: true,
    timestamps: false
})

const Rating = sequelize.define('rating', {
    book_id: {type: DataTypes.UUID, allowNull: false, references: {model: Book, key: 'book_id'}},
    user_id: {type: DataTypes.UUID, allowNull: false, references: {model: User, key: 'user_id'}},
    rate: {type: DataTypes.INTEGER, allowNull: false}
}, {
    freezeTableName: true,
    timestamps: false,
})

Book.belongsToMany(User, {through: BookAuthor, foreignKey: "book_id", as: "BookAuthor"})
User.belongsToMany(Book, {through: BookAuthor, foreignKey: "user_id", as: "BookAuthor"})

Book.belongsToMany(User, {through: BookReader, foreignKey: "book_id", as: "BookReader"})
User.belongsToMany(Book, {through: BookReader, foreignKey: "user_id", as: "BookReader"})

Book.belongsToMany(User, {through: Comments, foreignKey: "book_id", as: "Comments"})
User.belongsToMany(Book, {through: Comments, foreignKey: "user_id", as: "Comments"})

Book.belongsToMany(User, {through: Rating, foreignKey: "book_id", as: "Rating"})
User.belongsToMany(Book, {through: Rating, foreignKey: "user_id", as: "Rating"})

module.exports = {
    User,
    Book,
    BookAuthor,
    BookReader,
    Comments,
    Rating,
}