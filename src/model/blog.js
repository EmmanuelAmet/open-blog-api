const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({
    title: {
        required: true,
        type: String,
        trim: true
    },
    description: {
        required: false,
        type: String,
        trim: true,
        default: ''
    },
    imageUrl: {
        required: true,
        type: String,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
}, {
    timestamps: true
})

blogSchema.methods.toJSON = function() {
    const blog = this
    const blogObject = blog.toObject()

    delete blogObject.user.password
    delete blogObject.user.tokens
    delete blogObject.user.__v

    return blogObject
}

const Blog = new mongoose.model('Blog', blogSchema)

module.exports = Blog