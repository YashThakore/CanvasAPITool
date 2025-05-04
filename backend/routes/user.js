const express = require('express')
const router = express.Router()
const User = require('../models/User')
const fetch = require('node-fetch')
const ical = require('ical')

// POST /api/user/save-token
router.post('/save-token', async (req, res) => {
    const { canvasToken } = req.body

    try {
        const profileRes = await fetch('https://webcourses.ucf.edu/api/v1/users/self/profile', {
            headers: { Authorization: `Bearer ${canvasToken}` }
        })

        if (!profileRes.ok) return res.status(401).json({ error: 'Invalid token' })

        const profile = await profileRes.json()
        const email = profile.primary_email || profile.login_id
        const name = profile.name
        const calendarIcsUrl = profile.calendar?.ics

        const user = await User.findOneAndUpdate(
            { email },
            { canvasToken, name, calendarIcsUrl },
            { upsert: true, new: true }
        )

        res.json({ message: 'Token saved', email })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to save token' })
    }
})

router.get('/:email/sync-courses', async (req, res) => {
    const { email } = req.params

    try {
        const user = await User.findOne({ email })
        if (!user) return res.status(404).json({ error: 'User not found' })

        const canvasRes = await fetch('https://webcourses.ucf.edu/api/v1/courses', {
            headers: {
                Authorization: `Bearer ${user.canvasToken}`
            }
        })

        if (!canvasRes.ok) {
            const err = await canvasRes.json()
            return res.status(canvasRes.status).json(err)
        }

        const rawCourses = await canvasRes.json()
        const courses = rawCourses.map(c => ({
            courseId: c.id,
            name: c.name,
            code: c.course_code
        }))

        user.courses = courses
        await user.save()

        res.json({ message: 'Courses synced', courses })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to sync courses' })
    }
})

router.get('/:email/calendar', async (req, res) => {
    const { email } = req.params

    try {
        const user = await User.findOne({ email })
        if (!user || !user.calendarIcsUrl) {
            return res.status(404).json({ error: 'User or calendar not found' })
        }

        const response = await fetch(user.calendarIcsUrl)
        const icsText = await response.text()

        const events = ical.parseICS(icsText)

        const now = new Date()
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay()) // Sunday

        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)

        const nextWeekStart = new Date(endOfWeek)
        nextWeekStart.setDate(nextWeekStart.getDate() + 1)

        const nextWeekEnd = new Date(nextWeekStart)
        nextWeekEnd.setDate(nextWeekEnd.getDate() + 6)

        const thisWeek = []
        const nextWeek = []

        for (const key in events) {
            const ev = events[key]
            if (!ev.start || !ev.summary) continue

            const due = new Date(ev.start)
            const item = {
                name: ev.summary,
                due_at: due.toISOString(),
                description: ev.description || '',
                location: ev.location || '',
                url: ev.url || ''
            }

            if (due >= startOfWeek && due <= endOfWeek) {
                thisWeek.push(item)
            } else if (due >= nextWeekStart && due <= nextWeekEnd) {
                nextWeek.push(item)
            }
        }

        res.json({ thisWeek, nextWeek })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to parse calendar' })
    }
})

router.get('/profile', async (req, res) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid token' })
    }

    const canvasToken = authHeader.split(' ')[1]

    try {
        const user = await User.findOne({ canvasToken })

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        res.json({
            name: user.name,
            email: user.email,
            calendarIcsUrl: user.calendarIcsUrl,
            courses: user.courses
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to load profile' })
    }
})

module.exports = router
