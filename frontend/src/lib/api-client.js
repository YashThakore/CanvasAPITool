const API_BASE = 'http://localhost:5000/api'

export async function saveToken(email, token) {
  const res = await fetch(`${API_BASE}/user/save-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, canvasToken: token })
  })
  return res.json()
}

export async function syncCourses(email) {
  const res = await fetch(`${API_BASE}/user/${email}/sync-courses`)
  return res.json()
}

export async function getAssignments(email, courseId) {
  const res = await fetch(`${API_BASE}/user/${email}/course/${courseId}/assignments`)
  return res.json()
}
