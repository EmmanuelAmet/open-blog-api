const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name: {
        required: true,
        type: String,
        trim: true
    },
    activate: {
        required: true,
        type: String,
        default: false
    },
    status: {
        required: true,
        type: String,
        trim: true,
        default: 'active'
    },
    avatar: {
        type: String,
        trim: true,
        required: true,
        default: 'https://media.istockphoto.com/vectors/default-profile-picture-avatar-photo-placeholder-vector-illustration-vector-id1223671392?k=20&m=1223671392&s=170667a&w=0&h=kEAA35Eaz8k8A3qAGkuY8OZxpfvn9653gDjQwDHZGPE='
    },
    email: {
        required: true,
        trim: true,
        type: String,
        unique: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email.')
            }
        }
    },
    password: {
        required: true,
        trim: true,
        type: String,
        minlength: 8,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('password must not contain password.')
            }
        }
    },
    tokens: [{
        token: {
            require: true,
            type: String
        }
    }]
}, {
    timestamps: true
})

userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token: token })
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async(email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }
    return user
}

//Hashing before saving user
userSchema.pre('save', async function(next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

//Delete blog when user is remove
userSchema.pre('remove', async function(next) {
    const user = this
    await Blog.deleteMany({ owner: user._id })
    next()
})


const User = new mongoose.model('User', userSchema)

module.exports = User