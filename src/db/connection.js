const mongoose = require('mongoose')

const url = process.env.DB_CONNECTION_URI
mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})