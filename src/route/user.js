const express = require('express')
const router = express.Router()
const User = require('../model/user')
const auth = require('../middleware/auth')

//Create user
router.post('/api/v1/users', async(req, res) => {
    try {
        const user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send({message: e})
    }
})

//User login
router.post('/api/v1/users/login', async(req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send({message: e})
    }
})

//User details
router.get('/api/v1/users/me', auth, async(req, res) => {
    try {
        await res.send(req.user)
    } catch (e) {
        res.status(400).send({message: e})
    }
})

//Reading all users
router.get('/api/v1/users/all', auth, async(req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send(e)
    }
})

//Logout user
router.post('/api/v1/users/logout', auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send({message: e})
    }
})

//Logout from all account
router.post('/api/v1/users/logoutAll', auth, async(req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send({message: e})
    }
})

//Update user profile
router.patch('/api/v1/users/me', auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'password', 'avatar']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })
    if (!isValidOperation) {
        return res.status(400).send({ 'message': 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => {
            req.user[update] = req.body[update]
        })
        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.status(400).send({message: e})
    }
})

//Delete user
router.delete('/api/v1/users/me', auth, async(req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send({message: e})
    }
})

module.exports = router