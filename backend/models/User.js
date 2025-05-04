const mongoose = require('mongoose')

const assignmentSchema = new mongoose.Schema({
  assignmentId: Number,
  name: String,
  due_at: String,
  html_url: String
})

const courseSchema = new mongoose.Schema({
  courseId: Number,
  name: String,
  code: String,
  assignments: [assignmentSchema]
})

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    canvasToken: { type: String, required: true },
    name: String,
    calendarIcsUrl: String,
    courses: [courseSchema]
  })  

module.exports = mongoose.model('User', userSchema)
