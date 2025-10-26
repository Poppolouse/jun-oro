import { useState, useEffect } from 'react'

function LiveClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return date.toLocaleDateString('tr-TR', options)
  }

  return (
    <div className="glass rounded-xl p-6">
      <div className="text-center">
        <div className="text-5xl font-bold text-neon-green mb-2 font-mono">
          {formatTime(time)}
        </div>
        <div className="text-sm text-gray-400">
          {formatDate(time)}
        </div>
      </div>
    </div>
  )
}

export default LiveClock
