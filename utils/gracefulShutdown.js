
const { logAction } = require('../logs/custom');
const { saveServiceState, loadServiceState } = require('./serviceStateHandler');



async function gracefulShutdown(server) {
    console.log('Initiating graceful shutdown...');
    logAction('system-shutdown', { message: 'Initiating graceful shutdown...' });
    let hadError = false; // Variable to track if there was an error

    // Stop accepting new connections by closing the server
    server.close(() => {
        console.log('HTTP server closed.');
        logAction('system-shutdown', { message: 'HTTP server closed.' });

    });

    // Handle additional cleanup logic
    try {
        let serviceState = loadServiceState();
        serviceState.running = false;
        await saveServiceState(serviceState);
        console.log('Service state saved.');
        logAction('system-shutdown', { message: 'Service state saved.' });

        // Add any other cleanup logic here, e.g., closing database connections

        console.log('Cleanup complete, shutting down.');
        logAction('system-shutdown', { message: 'Cleanup complete, shutting down.' });
    } catch (error) {
        console.error('Error during shutdown:', error);
        logAction('system-shutdown-error', { message: 'Error during shutdown', error });
    } finally {
        // Exit the process after cleanup or if there was an error
        process.exit(hadError ? 1 : 0);
    }
}

module.exports = gracefulShutdown;