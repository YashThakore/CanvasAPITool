'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function DashboardPage() {
    const [name, setName] = useState('');
    const [weekData, setWeekData] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const canvasToken = localStorage.getItem('canvas_token');

            if (!canvasToken) {
                console.error('No Canvas token found in localStorage');
                return;
            }

            try {
                // Fetch profile
                const profileRes = await fetch('http://localhost:5000/api/user/profile', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${canvasToken}`
                    }
                });

                const profile = await profileRes.json();
                setName(profile.name || 'User');

                // Fetch assignments
                const coursesRes = await fetch('http://localhost:5000/api/courses/assignments', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${canvasToken}`
                    }
                });

                const data = await coursesRes.json();

                if (!data || !Array.isArray(data.assignments)) {
                    console.error('Assignments not found or invalid format:', data);
                    return;
                }

                const assignments = data.assignments;

                // Setup 7-day window (Sunday to Saturday of current week)
                const now = new Date();
                const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday
                const tempWeekData = [];

                for (let i = 0; i < 7; i++) {
                    const dayDate = new Date(startOfWeek);
                    dayDate.setDate(dayDate.getDate() + i);
                    const label = dayDate.toLocaleDateString('en-US', { weekday: 'long' });

                    const dayTasks = assignments.filter(a => {
                        if (!a.due_at) return false;
                        const dueDate = new Date(a.due_at);
                        return (
                            dueDate.getFullYear() === dayDate.getFullYear() &&
                            dueDate.getMonth() === dayDate.getMonth() &&
                            dueDate.getDate() === dayDate.getDate()
                        );
                    });

                    tempWeekData.push({
                        label,
                        total: dayTasks.length,
                        completed: 0, // You can update this if submission data is added
                        tasks: dayTasks.map(t => t.name)
                    });
                }

                setWeekData(tempWeekData);
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    function handleDayClick(day) {
        setSelectedDay(day);
    }

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-center h-screen bg-gray-900 text-white"
            >
                <p className="text-xl animate-pulse">Loading dashboard...</p>
            </motion.div>
        );
    }

    return (

        <div className="flex h-screen bg-gray-900 text-white">

            {/* Sidebar */}
            <aside className="w-48 bg-[#0a1240] flex flex-col items-center py-8 space-y-10">
                <div className="flex flex-col items-center space-y-6">
                    <div className="flex flex-col items-center">
                        <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        <span>Courses</span>
                    </div>

                    <div className="flex flex-col items-center">
                        <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z" />
                        </svg>
                        <span>Calendar</span>
                    </div>
                </div>

                <button className="mt-auto text-sm text-red-400 hover:text-red-300">
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                    </svg>
                    Log Out
                </button>
            </aside>

            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex-1 flex flex-col items-center justify-center min-h-screen p-6"
            >
                {/* Main Content */}
                <main className="flex-1 flex flex-col items-center justify-center min-h-screen p-6">
                    <div className="flex flex-col items-center">
                        <h1 className="text-7xl font-bold mb-12">Welcome, {name}!</h1>

                        {/* Taskbar */}
                        <div className="relative w-[1000px] flex flex-col items-center translate-y-12">
                            {/* Line behind dots */}
                            <div className="h-2 bg-white w-full absolute top-1/2 transform -translate-y-1/2 z-0 rounded-full"></div>

                            {/* Task Dots */}
                            <div className="flex justify-between items-center w-full z-10">
                                {weekData.map((day, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col items-center group relative -mt-5" // << added this line
                                    >
                                        <span className="text-sm text-gray-300 mb-3">{day.label}</span> {/* adjust label down slightly */}
                                        <div
                                            className="w-10 h-10 rounded-full bg-gray-200 text-black font-semibold flex items-center justify-center cursor-pointer hover:bg-blue-400"
                                            onClick={() => handleDayClick(day)}
                                        >
                                            {day.total > 0 ? `${day.completed}/${day.total}` : '0'}
                                        </div>

                                        {day.tasks.length > 0 && (
                                            <div className="absolute bottom-full mb-2 px-3 py-2 text-sm bg-gray-800 text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap">
                                                {day.tasks.map((task, i) => (
                                                    <div key={i}>{task}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {selectedDay && (
                                    <div className="absolute right-0 top-0 h-full w-96 bg-gray-800 p-6 text-white shadow-lg overflow-y-auto z-50">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl font-semibold">{selectedDay.label}'s Assignments</h2>
                                            <button onClick={() => setSelectedDay(null)} className="text-red-400 hover:text-red-200">Close</button>
                                        </div>
                                        {selectedDay.tasks.length > 0 ? (
                                            <ul className="space-y-2">
                                                {selectedDay.tasks.map((task, i) => (
                                                    <li key={i} className="bg-gray-700 p-3 rounded">{task}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>No assignments due on this day.</p>
                                        )}
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </main>

            </motion.main>



        </div>
    )
}
