const express = require('express')
require('./db/connection')
const userRoute = require('./route/user')
const blogRoute = require('./route/blog')

const app = express()
app.use(express.json())

const port = process.env.PORT || 8000

app.use(userRoute)
app.use(blogRoute)

app.listen(port, () => {
    console.log('server is up and running on port: ' + port)
})