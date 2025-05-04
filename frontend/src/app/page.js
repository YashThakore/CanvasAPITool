'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [token, setToken] = useState('')
  const router = useRouter()

  const handleSubmit = async () => {
    try {
      // Use token to fetch profile and store it
      const profileRes = await fetch('http://localhost:5000/api/fetch-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvasToken: token })
      })      

      const profileData = await profileRes.json()
      if (!profileData.primary_email) {
        alert('Invalid access token or failed to fetch profile.')
        return
      }

      // Save to backend
      const saveRes = await fetch('http://localhost:5000/api/user/save-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvasToken: token })
      })

      const saveData = await saveRes.json()
      localStorage.setItem('canvas_email', profileData.primary_email)
      localStorage.setItem('canvas_token', token)

      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      alert('Something went wrong. Please check your token and try again.')
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-lg shadow-lg border border-gray-700">
        <h1 className="text-3xl font-bold text-center mb-6">Canvas Sync Portal</h1>

        <p className="text-sm text-gray-300 mb-4">
          Paste your <strong>Canvas Access Token</strong> below to sync your courses and assignments.
        </p>
        <div className="text-sm text-gray-400 bg-gray-800 p-4 rounded mb-6 border border-gray-700">
          <p className="font-semibold text-white mb-2">How to get your Canvas Access Token:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Go to your school’s Canvas home page (e.g., <code>https://webcourses.ucf.edu</code>).</li>
            <li>Click <strong>Account</strong> in the left sidebar, then <strong>Settings</strong>.</li>
            <li>Scroll down to the section labeled <strong>Approved Integrations</strong>.</li>
            <li>Click <strong>+ New Access Token</strong>.</li>
            <li>Enter a name (like <em>My Dashboard</em>) and an expiration date (or leave it blank).</li>
            <li>Click <strong>Generate Token</strong>.</li>
            <li>Copy the full token and paste it into the field below.</li>
          </ol>
        </div>

        <textarea
          placeholder="Paste token here..."
          className="w-full p-2 mb-6 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          onChange={e => setToken(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded font-semibold"
        >
          Sync My Dashboard
        </button>
      </div>
    </main>
  )
}
