const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: false // Permitirá que o MongoDB gere automaticamente se não for fornecido
    },
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    isbn: {
        type: String,
        required: true
    },
    published_year: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    available: {
        type: Boolean,
        default: true
    }
}, {
    _id: false // Isso permite que usemos nosso próprio campo _id
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;