const fs = require('fs').promises; // Use the promise-based version of fs
const path = require('path');
const { logAction } = require('../logs/custom');

async function checkAndDeleteFile() {
    const filePath = path.join(__dirname, '../pushConfigState.json');

    try {
        // Check if the file exists
        await fs.access(filePath);
        // If the file exists, delete it
        await fs.unlink(filePath);
        logAction('system-shutdown', { message: 'pushConfigState File deleted successfully.' });

        console.log('File deleted successfully.');
    } catch (err) {
        // If error is because the file does not exist
        if (err.code === 'ENOENT') {
            console.log('File does not exist.');
            logAction('system-shutdown-error', { message: 'File does not exist.', err });

        } else {
            // Handle other potential errors
            logAction('system-shutdown-error', { message: 'An error occurred:', err });

            console.error('An error occurred:', err);
        }
    }
}

// Call the function
module.exports = checkAndDeleteFile;
