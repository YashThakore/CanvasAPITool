const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', async (req, res) => {
    const email = req.query.email;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.courses);
});

router.get('/assignments', async (req, res) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
  
    const canvasToken = authHeader.split(' ')[1];
  
    try {
      // Fetch profile from Canvas using token
      const profileRes = await fetch('https://webcourses.ucf.edu/api/v1/users/self/profile', {
        headers: { Authorization: `Bearer ${canvasToken}` }
      });
  
      const profile = await profileRes.json();
      const email = profile.primary_email;
  
      const user = await User.findOne({ email });
  
      if (!user || !user.courses || user.courses.length === 0) {
        return res.json({ assignments: [] });
      }
  
      // Flatten and collect all assignments
      const allAssignments = user.courses.flatMap(course => course.assignments || []);
      res.json({ assignments: allAssignments });
    } catch (err) {
      console.error('Error fetching assignments:', err);
      res.status(500).json({ error: 'Failed to fetch assignments' });
    }
  });
  

module.exports = router;
