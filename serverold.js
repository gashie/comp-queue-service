require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const amqp = require('amqplib');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;
const pool = new Pool(); // Assumes environment variables for connection details
const logFilePath = path.join(__dirname, 'serviceLog.json');

let serviceState = {
    running: false,
    paused: false,
    taskCount: 0,
    completedTasks: 0,
};

// Set up RabbitMQ channel
let channel = null;
async function setupRabbitMQ() {
    try {
        const connection = await amqp.connect(process.env.AMQP_URL || 'amqp://localhost');
        channel = await connection.createChannel();
        await channel.assertQueue('task_queue', { durable: true });
    } catch (error) {
        console.error('RabbitMQ Setup Error:', error);
        logAction('error', { error: 'RabbitMQ setup failed', detail: error.message });
    }
}

// Logging function for actions and errors
const logAction = async (action, details) => {
    const logEntry = { timestamp: new Date().toISOString(), action, details };
    try {
        const logs = fs.existsSync(logFilePath) ? JSON.parse(fs.readFileSync(logFilePath).toString()) : [];
        logs.push(logEntry);
        fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));
    } catch (error) {
        console.error('Logging Error:', error);
    }
};

// Fetch pending tasks from the database
const fetchPendingTasks = async () => {
    try {
        const res = await pool.query('SELECT * FROM tasks WHERE processed_state = false');
        return res.rows;
    } catch (error) {
        logAction('error', { error: 'Failed to fetch tasks', detail: error.message });
        return [];
    }
};

// Process a task based on its type
const processTask = async (task) => {
    if (!channel) await setupRabbitMQ();
    // Example task processing based on type
    try {
        switch (task.type) {
            case 'api':
                // Simulate API call processing
                console.log(`Processing API task: ${task.id}`);
                break;
            case 'rabbitmq':
                // Example of publishing a task to RabbitMQ
                await channel.sendToQueue('task_queue', Buffer.from(JSON.stringify(task)), { persistent: true });
                console.log(`Published task ${task.id} to RabbitMQ`);
                break;
            default:
                console.error('Unknown task type:', task.type);
        }
        // Simulate updating task status in database
        serviceState.completedTasks++;
    } catch (error) {
        logAction('error', { error: 'Task processing failed', taskId: task.id, detail: error.message });
    }
};

// The main service loop
const serviceLoop = async () => {
    while (serviceState.running) {
        if (serviceState.paused) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Sleep while paused
            continue;
        }
        const tasks = await fetchPendingTasks();
        serviceState.taskCount = tasks.length;
        for (const task of tasks) {
            if (!serviceState.running) break; // Stop processing if service is stopped
            await processTask(task);
        }
        await new Promise(resolve => setTimeout(resolve, 5000)); // Delay between processing cycles
    }
};

// API Endpoints for service control and log retrieval
app.use(express.json());

app.post('/control', async (req, res) => {
    const { command } = req.body;
    try {
        switch (command.toLowerCase()) {
            case 'start':
                if (!serviceState.running) {
                    serviceState.running = true;
                    serviceState.paused = false;
                    logAction('start', { message: 'Service started' });
                    serviceLoop().catch(err => logAction('error', { error: 'Service loop error', detail: err.message }));
                    res.json({ message: 'Service started' });
                } else {
                    res.json({ message: 'Service already running' });
                }
                break;
            case 'stop':
                serviceState.running = false;
                logAction('stop', { message: 'Service stopped' });
                res.json({ message: 'Service stopping' });
                break;
            case 'pause':
                if (serviceState.running && !serviceState.paused) {
                    serviceState.paused = true;
                    logAction('pause', { message: 'Service paused' });
                    res.json({ message: 'Service paused' });
                } else {
                    res.json({ message: 'Service not running or already paused' });
                }
                break;
            case 'resume':
                if (serviceState.paused) {
                    serviceState.paused = false;
                    logAction('resume', { message: 'Service resumed' });
                    res.json({ message: 'Service resumed' });
                } else {
                    res.json({ message: 'Service not paused or not running' });
                }
                break;
            default:
                res.status(400).json({ message: 'Invalid command' });
        }
    } catch (error) {
        logAction('error', { error: 'Failed to execute command', command, detail: error.message });
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

app.get('/logs', (req, res) => {
    try {
        const logs = fs.existsSync(logFilePath) ? JSON.parse(fs.readFileSync(logFilePath).toString()) : [];
        const { startDate, endDate, ...otherFilters } = req.query;

        const filterLogs = (log) => {
            let matchesDateRange = true;
            let matchesOtherFilters = true;

            // Date range filtering
            if (startDate || endDate) {
                const logDate = new Date(log.timestamp).getTime();
                const startTimestamp = startDate ? new Date(startDate).getTime() : null;
                const endTimestamp = endDate ? new Date(endDate).getTime() + 86400000 : null; // Include the end date fully
                matchesDateRange = (startTimestamp ? logDate >= startTimestamp : true) &&
                                   (endTimestamp ? logDate < endTimestamp : true);
            }

            // Dynamic field-based filtering
            matchesOtherFilters = Object.keys(otherFilters).every(key => {
                const filterValue = otherFilters[key].toLowerCase();
                const [field, subfield] = key.split('.'); // Supports nested fields like 'details.message'

                if (subfield) {
                    return log[field] && log[field][subfield] && log[field][subfield].toString().toLowerCase().includes(filterValue);
                } else {
                    return log[field] && log[field].toString().toLowerCase().includes(filterValue);
                }
            });

            return matchesDateRange && matchesOtherFilters;
        };

        // Apply combined filters to logs
        const filteredLogs = logs.filter(filterLogs);

        res.json(filteredLogs);
    } catch (error) {
        console.error('Error reading logs:', error);
        res.status(500).send('Failed to retrieve logs');
    }
});


app.listen(port, () => {
    console.log(`API server running on http://localhost:${port}`);
    // setupRabbitMQ().catch(console.error); // Setup RabbitMQ at server start
    logAction('api_start', { message: 'API server started', port }).catch(console.error);
});
