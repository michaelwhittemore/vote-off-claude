import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import authRoutes from './routes/auth';
import bracketRoutes from './routes/brackets';
import entryRoutes from './routes/entries';
import voteRoutes from './routes/votes';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/brackets', bracketRoutes);
app.use('/api/brackets', entryRoutes);
app.use('/api/brackets', voteRoutes);

export default app;
