const { logAction } = require("../logs/custom");

module.exports = {
    fetchPendingTasks: async () => {
        try {
            const res = await pool.query('SELECT * FROM tasks WHERE processed_state = false');
            return res.rows;
        } catch (error) {
            logAction('error', { error: 'Failed to fetch tasks', detail: error.message });
            return [];
        }
    },
}