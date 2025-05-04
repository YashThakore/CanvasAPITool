const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')

router.post('/', async (req, res) => {
  const { canvasToken } = req.body
  if (!canvasToken) return res.status(400).json({ error: 'Missing token' })

  try {
    const response = await fetch('https://webcourses.ucf.edu/api/v1/users/self/profile', {
      headers: {
        Authorization: `Bearer ${canvasToken}`
      }
    })

    const profile = await response.json()
    if (!response.ok) return res.status(response.status).json({ error: profile.errors })

    res.json(profile)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

module.exports = router
