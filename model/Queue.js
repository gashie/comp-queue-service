const pool = require("../config/db");
const { logger } = require("../logs/winston");

let servicedb = {};


servicedb.pullQueue = () => {
    return new Promise((resolve, reject) => {
        pool.query(

            `
            SELECT 
            mc.monitor_name,
            pmq.push_queue_id,
            pmq.push_config_id,
            pmq.item_payload,
            pmq.item_enc_key,
            pmq.received_state,
            pmq.handshake_state,
            pmq.processed_state,
            pmq.received_at,
            pmq.handshaked_at,
            pmq.processed_at,
            pmq.pushed,
            pmq.pushed_at,
            pmq.message,
            pmq.acknowledged,
            pmq.acknowledged_at,
            pmq.push_type AS push_main_queue_push_type,
            pmq.monitor_id,
            pmq.sql_action
        FROM 
            public.push_main_queue pmq
        JOIN 
            public.monitor_configs mc
        ON 
            pmq.monitor_id = mc.monitor_id
        WHERE 
            pmq.processed_at IS NULL AND pmq.processed_state = false;
        
        
            `

            , [], (err, results) => {
                if (err) {
                    logger.error(err);
                    return reject(err);
                }

                return resolve(results);
            });
    });
};
servicedb.fetchConfig = () => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM push_config WHERE is_default = $1`, [true], (err, results) => {
            if (err) {
                logger.error(err);
                return reject(err);
            }

            return resolve(results);
        });
    });
};

module.exports = servicedb