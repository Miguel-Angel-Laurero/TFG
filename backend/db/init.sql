-- Script de referencia. Sequelize crea las tablas automáticamente con sync().
-- Usa este script si prefieres gestionar la BD manualmente (MySQL/PostgreSQL).
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS Games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    gameName VARCHAR(100) NOT NULL,
    score INTEGER DEFAULT 0,
    duration INTEGER DEFAULT 0,
    result VARCHAR(10) CHECK (result IN ('win', 'loss', 'draw')),
    playedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Usuario admin de ejemplo (contraseña: Admin1234)
-- Hash generado con bcryptjs rounds=12
INSERT
    OR IGNORE INTO Users (username, email, password, role)
VALUES (
        'admin',
        'admin@ludoscript.com',
        '$2a$12$exampleHashChangeThisInProduction000000000000000000000',
        'admin'
    );