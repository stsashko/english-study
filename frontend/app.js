import path from 'path';
import express from 'express';

import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { fileURLToPath } from 'url';

const app = express();
const host = '0.0.0.0'

app.use(express.static(path.resolve(__dirname, './build')));

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './build', 'index.html'));
});

app.listen(process.env.NODE_FRONTEND_PORT, host, function () {
    console.log(`Server for frontend listens http://${host}:${process.env.NODE_FRONTEND_PORT}`)
});