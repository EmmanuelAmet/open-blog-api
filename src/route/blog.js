const Blog = require('../model/blog')
const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')

//Create a blog - only auth users
router.post('/api/v1/blogs', auth, async(req, res) => {
    try {
        const blog = new Blog({
            ...req.body,
            user: req.user._id,
        })
        await blog.save()
        res.status(201).send(blog)
    } catch (e) {
        res.status(400).send(e)
    }
})

//Get all blog - public blog
router.get('/api/v1/blogs', async(req, res) => {
    try {
        const blog = await Blog.find({})
        if (!blog) {
            return res.status(404).send()
        }
        let blogs = await Blog.find({})
        .populate('user')
        .exec()
        res.send(blogs)
    } catch (e) {
        res.status(500).send({message: 'Error'})
    }
})

//All blog by specific user
router.get('/api/v1/blogs/user/:id', async(req, res) => {
    try {
        const id = req.params.id
        const blog = await Blog.find({user: `${id}`})
        .populate('user')
        .exec()
        res.send(blog)
    } catch (e) {
        res.status(400).json({message: e})
    }
})

//Update blog
router.patch('/api/v1/blogs/:id', auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title', 'description', 'imageUrl']

    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })
    if (!isValidOperation) {
        res.status(400).json({ 'Error': 'Invalide Update.' })
    }

    try {
        const _id = req.params.id
        const blog = await Blog.findOne({ _id })
        if (!blog) {
            return res.status(404).json()
        }
        updates.forEach((update) => {
            blog[update] = req.body[update]
        })
        await blog.save()
        res.json(blog)
    } catch (e) {
        res.status(400).json({error: e})
    }
})

//Get all blogs created by a user
router.get('/api/v1/blogs/me', auth, async(req, res) => {
    try {
        const blog = await Blog.find({organizer:`${req.user._id}`})
        .populate('user')
        .exec()
        res.status(200).json(blog)
    } catch (e) {
        res.status(500).json(e)
    }
})

// Search blog by title
router.get('/v1/blogs/query/:title', async(req, res) => {
    const search = req.params.title
    try {
        const blog = await Blog.find({title: { $regex: '.*' + search + '.*' } }).limit(10);
        if (!blog) {
            return res.status(404).json()
        }
        res.json(blog)
    } catch (e) {
        res.status(500).send(e)
    }
})

//Delete blog
router.delete('/api/v1/blogs/:id', auth, async(req, res) => {
    try {
        const _id = req.params.id
        const blog = await Blog.findOneAndDelete({ _id: _id, owner: req.user._id })
        if (!blog) {
            return res.status(404).send()
        }
        res.send(blog)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router