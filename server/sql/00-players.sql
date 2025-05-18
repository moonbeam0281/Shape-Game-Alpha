CREATE TABLE
  IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    state VARCHAR(50) DEFAULT 'main menu'
  );