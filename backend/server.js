import express from 'express';
import cors from 'cors';
import { Task } from './models/index.js';
import sequelize from './config/database.js';
import process from 'process';

const app = express();
const PORT = process.env.PORT || 1337;

app.use(cors(
    {
        origin : 'http://localhost:5173'
    }
));

app.use(express.json());

const initializeDatabase = async() => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');
    }
    catch (error) {
        console.error('Unable to connect to database:', error);
    }
};

// Load all tasks
app.get('/api/load', async(req, res) => {
    try {
        const tasks = await Task.findAll({ order : [['id', 'ASC']] });

        res.json({
            success : true,
            tasks   : {
                rows : tasks
            }
        });
    }
    catch (error) {
        console.error('Error loading data:', error);
        res.status(500).json({ success : false, message : error.message });
    }
});

// Create a task
app.post('/api/tasks', async(req, res) => {
    try {
        const task = await Task.create(req.body);
        res.json({ success : true, task });
    }
    catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ success : false, message : error.message });
    }
});

// Update a task
app.put('/api/tasks/:id', async(req, res) => {
    try {
        const { id } = req.params;
        await Task.update(req.body, { where : { id } });
        res.json({ success : true });
    }
    catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ success : false, message : error.message });
    }
});

// Delete a task
app.delete('/api/tasks/:id', async(req, res) => {
    try {
        const { id } = req.params;
        await Task.destroy({ where : { id } });
        res.json({ success : true });
    }
    catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ success : false, message : error.message });
    }
});

app.listen(PORT, async() => {
    await initializeDatabase();
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
