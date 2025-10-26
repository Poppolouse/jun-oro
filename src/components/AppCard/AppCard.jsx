function AppCard({ icon, title, description, stats, onClick }) {
  return (
    <div 
      className="glass p-6 rounded-xl hover:scale-105 transition-all duration-300 cursor-pointer border border-primary-500/30"
      onClick={onClick}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-white">
        {title}
      </h3>
      <p className="text-sm mb-2 text-gray-300">
        {description}
      </p>
      {stats && (
        <p className="text-xs text-gray-500">
          {stats}
        </p>
      )}
    </div>
  )
}

export default AppCard