const asyncHandler = require("../middleware/async");
const { sendResponse, CatchHistory } = require("../helper/utilfunc");
const fs = require('fs');
const path = require('path');
const { logFilePath } = require("../exports/serviceState");
// const serviceState = require("../exports/serviceState");
const { logAction } = require("../logs/custom");
const { serviceLoop } = require("../service/loop");
const { loadServiceState, saveServiceState } = require('../utils/serviceStateHandler');


exports.SystemControl = asyncHandler(async (req, res, next) => {
    let serviceState = loadServiceState(); // Ensure this is synchronous or properly awaited if asynchronous
    const { command } = req.body;

    try {
        switch (command.toLowerCase()) {
            case 'start':
                if (!serviceState.running) {
                    serviceState.running = true;
                    serviceState.paused = false;
                    await saveServiceState(serviceState); // Ensure proper awaiting
                    logAction('start', { message: 'Service started' });
                    serviceLoop().catch(err => logAction('error', { error: 'Service loop error', detail: err.message }));
                    return sendResponse(res, 1, 200, 'Service started', []);
                } else {
                    return sendResponse(res, 1, 200, 'Service already running', []);
                }
            case 'stop':
                serviceState.running = false;
                await saveServiceState(serviceState); // Ensure state changes are saved before stopping
                logAction('stop', { message: 'Service stopped' });
                // Consider adding logic here to ensure the service loop terminates before sending a response
                return sendResponse(res, 1, 200, 'Service stopping', []);
            case 'pause':
                if (serviceState.running && !serviceState.paused) {
                    serviceState.paused = true;
                    await saveServiceState(serviceState);
                    logAction('pause', { message: 'Service paused' });
                    return sendResponse(res, 1, 200, 'Service paused', []);
                } else {
                    return sendResponse(res, 1, 200, 'Service not running or already paused', []);
                }
            case 'resume':
                if (serviceState.paused) {
                    serviceState.paused = false;
                    serviceState.running = true;
                    await saveServiceState(serviceState);
                    logAction('resume', { message: 'Service resumed' });
                    return sendResponse(res, 1, 200, 'Service resumed', []);
                } else {
                    return sendResponse(res, 1, 200, 'Service not paused or not running', []);
                }
            case 'shutdown':
                if (serviceState.running && !serviceState.shutdown) {
                    serviceState.shutdown = true;
                    saveServiceState(serviceState); // Signal the service loop to shutdown gracefully
                    logAction('shutdown', { message: 'Initiating graceful shutdown' });
                    // Optionally, wait for the service loop to detect the shutdown and exit
                    return sendResponse(res, 1, 200, 'Graceful shutdown initiated', []);
                } else {
                    return sendResponse(res, 1, 200, 'Service not running or shutdown already initiated', []);
                }
            default:
                return sendResponse(res, 0, 200, 'Invalid command', []);
        }
    } catch (error) {
        logAction('error', { error: 'Failed to execute command', command, detail: error.message });
        return sendResponse(res, 0, 500, 'An error occurred while processing your request.');
    }
});

