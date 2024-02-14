const fs = require('fs');

const { logFilePath } = require("../exports/serviceState");

module.exports = {

    logAction: async (action, details) => {
        const logEntry = { timestamp: new Date().toISOString(), action, details };
        try {
            const logs = fs.existsSync(logFilePath) ? JSON.parse(fs.readFileSync(logFilePath).toString()) : [];
            logs.push(logEntry);
            fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));
        } catch (error) {
            console.error('Logging Error:', error);
        }

    },
}