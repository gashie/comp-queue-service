const fs = require('fs');
const path = require('path');

let serviceState = {
    running: false,
    paused: false,
    taskCount: 0,
    completedTasks: 0,
    logFilePath: path.join(__dirname, '../serviceLog.json'),
    channel : null,

};

module.exports = serviceState;
