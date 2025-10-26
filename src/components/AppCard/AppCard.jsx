function AppCard({ icon, title, description, stats, onClick }) {
  return (
    <div 
      className="glass p-6 rounded-xl hover:scale-105 transition-all duration-300 cursor-pointer glow"
      onClick={onClick}
      style= border: '1px solid rgba(102, 126, 234, 0.3)' 
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 
        className="text-xl font-semibold mb-2" 
        style= color: 'var(--text-primary)' 
      >
        {title}
      </h3>
      <p 
        className="text-sm mb-2" 
        style= color: 'var(--text-secondary)' 
      >
        {description}
      </p>
      {stats && (
        <p 
          className="text-xs" 
          style= color: 'var(--text-muted)' 
        >
          {stats}
        </p>
      )}
    </div>
  )
}

export default AppCard