// server.js - Backend para Node.js & Express
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
const browserBuild = path.join(__dirname, 'dist', 'eguizbeats', 'browser');
app.use(express.static(browserBuild));

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:tu_password@localhost:5432/eguizbeats_db'
});

// Endpoint para obtener todos los beats desde PostgreSQL
app.get('/api/beats', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM beats ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint para streaming de preview con marca de agua
app.get('/api/beats/preview/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT preview_url FROM beats WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).send('Beat no encontrado');
        res.json({ streamUrl: result.rows[0].preview_url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint protegido para descarga del Master WAV tras compra confirmada
app.get('/api/download/master/:token', async (req, res) => {
    const { token } = req.params;
    try {
        const licenseCheck = await pool.query('SELECT * FROM licenses WHERE secure_download_token = $1', [token]);
        if (licenseCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Acceso denegado: Token de licencia inválido o expirado' });
        }
        // Descarga segura del archivo master
        res.download('./secure-storage/master_audio_sample.wav');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(browserBuild, 'index.html'), (err) => {
        if (err) next(err);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de eguizbeats corriendo exitosamente en http://localhost:${PORT}`);
});