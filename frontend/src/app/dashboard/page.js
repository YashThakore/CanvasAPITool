'use client'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
    const [email, setEmail] = useState(null)
    const [name, setName] = useState('')
    const [assignmentsThisWeek, setAssignmentsThisWeek] = useState([])
    const [assignmentsNextWeek, setAssignmentsNextWeek] = useState([])

    useEffect(() => {
        const storedEmail = localStorage.getItem('canvas_email')
        if (!storedEmail) return

        setEmail(storedEmail)

        // Fetch calendar events and profile
        const loadData = async () => {
            const calendarRes = await fetch(`http://localhost:5000/api/user/${storedEmail}/calendar`)
            const calendarData = await calendarRes.json()
            setAssignmentsThisWeek(calendarData.thisWeek || [])
            setAssignmentsNextWeek(calendarData.nextWeek || [])

            const profileRes = await fetch(`http://localhost:5000/api/user/${storedEmail}/sync-courses`)
            const profileData = await profileRes.json()

        }

        loadData()
    }, [])

    useEffect(() => {
        const token = localStorage.getItem('canvas_token')
        if (!token) return
      
        fetch('http://localhost:5000/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
          .then(res => res.json())
          .then(data => {
            if (data.name) setName(data.name)
            if (data.email) setEmail(data.email)
          })
      }, [])
      

    const renderAssignmentList = (assignments) => (
        <ul className="space-y-2">
            {assignments.map((a, idx) => (
                <li key={idx} className="bg-gray-800 p-4 rounded">
                    <div className="font-medium">{a.name}</div>
                    <div className="text-sm text-gray-400">Due: {new Date(a.due_at).toLocaleString()}</div>
                    {a.url && (
                        <a href={a.url} className="text-blue-400 text-sm" target="_blank" rel="noopener noreferrer">
                            View
                        </a>
                    )}
                </li>
            ))}
        </ul>
    )

    return (
        <main className="min-h-screen bg-gray-900 text-white p-6">
            <h1 className="text-3xl font-bold mb-6">Welcome{name ? `, ${name}` : ''}!</h1>

            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl mb-4">📆 Assignments This Week</h2>
                    {assignmentsThisWeek.length ? renderAssignmentList(assignmentsThisWeek) : <p className="text-gray-400">No assignments this week.</p>}
                </div>

                <div>
                    <h2 className="text-xl mb-4">📆 Assignments Next Week</h2>
                    {assignmentsNextWeek.length ? renderAssignmentList(assignmentsNextWeek) : <p className="text-gray-400">No assignments next week.</p>}
                </div>
            </div>
        </main>
    )
}
