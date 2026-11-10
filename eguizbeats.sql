
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'client',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE beats (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    producer VARCHAR(255) DEFAULT 'Eguiz',
    bpm INT,
    key_scale VARCHAR(50),
    preview_url TEXT NOT NULL,
    master_url TEXT NOT NULL,
    price_basic NUMERIC(10, 2),
    price_exclusive NUMERIC(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE licenses (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    beat_id INT REFERENCES beats(id),
    license_type VARCHAR(100),
    secure_download_token VARCHAR(255) UNIQUE,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos de prueba iniciales para la base de datos
INSERT INTO beats (title, bpm, key_scale, preview_url, master_url, price_basic, price_exclusive) 
VALUES 
('[FREE] "Crime Scene" - 21 Savage X Young Nudy type beat', 148, 'F minor', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', '/secure/crime_scene_master.wav', 34.99, 499.99),
('[FREE] "Heat Check" - Nardo Wick type beat', 171, 'C# minor', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', '/secure/heat_check_master.wav', 34.99, 499.99);