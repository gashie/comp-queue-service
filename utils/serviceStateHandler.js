// utils/serviceStateHandler.js
const fs = require('fs');
const path = require('path');
const stateFilePath = path.join(__dirname, '../serviceState.json');
const pcfgFilePath = path.join(__dirname, '../pushConfigState.json');

// Load the current state from file
function loadServiceState() {
    if (fs.existsSync(stateFilePath)) {
        const stateData = fs.readFileSync(stateFilePath);
        return JSON.parse(stateData);
    }
    return {
        running: false,
        paused: false,
        taskCount: 0,
        completedTasks: 0,
        shutdown: false ,
    };
}

// Save the current state to file
function saveServiceState(state) {
    fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2));
}

module.exports = { loadServiceState, saveServiceState };
