-- Jun Oro Database Schema
-- Created: 2025-11-02

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    profile_image_url TEXT,
    bio TEXT,
    preferences TEXT -- JSON string for user preferences
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    genre TEXT,
    platform TEXT,
    release_date DATE,
    developer TEXT,
    publisher TEXT,
    rating REAL CHECK (rating >= 0 AND rating <= 10),
    image_url TEXT,
    trailer_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    metadata TEXT, -- JSON string for additional game data
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- User game library (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game_id INTEGER NOT NULL,
    status TEXT DEFAULT 'want_to_play' CHECK (status IN ('playing', 'completed', 'want_to_play', 'dropped')),
    rating REAL CHECK (rating >= 0 AND rating <= 10),
    review TEXT,
    play_time_hours INTEGER DEFAULT 0,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    UNIQUE(user_id, game_id)
);

-- Sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- API Keys table for external integrations
CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key_name TEXT NOT NULL,
    key_hash TEXT UNIQUE NOT NULL,
    user_id INTEGER,
    permissions TEXT, -- JSON string for permissions
    is_active BOOLEAN DEFAULT TRUE,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_used_at DATETIME,
    usage_count INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Game categories/tags
CREATE TABLE IF NOT EXISTS game_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT, -- Hex color for UI
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many relationship between games and tags
CREATE TABLE IF NOT EXISTS game_tag_relations (
    game_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (game_id, tag_id),
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES game_tags(id) ON DELETE CASCADE
);

-- User reviews and ratings
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game_id INTEGER NOT NULL,
    rating REAL NOT NULL CHECK (rating >= 0 AND rating <= 10),
    title TEXT,
    content TEXT,
    is_spoiler BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    helpful_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    UNIQUE(user_id, game_id)
);

-- File uploads tracking
CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    r2_key TEXT UNIQUE NOT NULL,
    public_url TEXT,
    uploaded_by INTEGER,
    upload_type TEXT DEFAULT 'general' CHECK (upload_type IN ('profile_image', 'game_image', 'game_trailer', 'general')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_games_title ON games(title);
CREATE INDEX IF NOT EXISTS idx_games_genre ON games(genre);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_user_games_user_id ON user_games(user_id);
CREATE INDEX IF NOT EXISTS idx_user_games_game_id ON user_games(game_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_game_id ON reviews(game_id);
CREATE INDEX IF NOT EXISTS idx_uploads_uploaded_by ON uploads(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_uploads_r2_key ON uploads(r2_key);

-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@junoro.com', '$2b$10$rQJ8YnBVGQxnvwQxQxQxQeJ8YnBVGQxnvwQxQxQxQeJ8YnBVGQxnvw', 'admin');

-- Insert some default game tags
INSERT OR IGNORE INTO game_tags (name, description, color) VALUES
('Action', 'Fast-paced games with combat and challenges', '#FF6B6B'),
('Adventure', 'Story-driven exploration games', '#4ECDC4'),
('RPG', 'Role-playing games with character development', '#45B7D1'),
('Strategy', 'Games requiring tactical thinking', '#96CEB4'),
('Simulation', 'Games that simulate real-world activities', '#FFEAA7'),
('Puzzle', 'Games focused on problem-solving', '#DDA0DD'),
('Horror', 'Scary and suspenseful games', '#2D3436'),
('Multiplayer', 'Games designed for multiple players', '#00B894'),
('Indie', 'Independent developer games', '#FDCB6E'),
('Retro', 'Classic or retro-style games', '#E17055');