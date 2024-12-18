DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  slack_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  image TEXT,
  timezone VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status_text TEXT,
  title TEXT,
  deleted BOOLEAN DEFAULT FALSE
);

