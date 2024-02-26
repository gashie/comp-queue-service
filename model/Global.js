const pool = require("../config/db");
const { prepareColumns } = require("../helper/global");
const { logger } = require("../logs/winston");

let servicedb = {};



servicedb.Finder = (tableName, columnsToSelect, conditions) => {
    return new Promise((resolve, reject) => {
        // Build the dynamic SQL query with the dynamic conditions
        const conditionClauses = [];
        const values = [];

        conditions.forEach((conditionObj, index) => {
            if (conditionObj.operator === 'IS NOT NULL') {
                conditionClauses.push(`"${conditionObj.column}" IS NOT NULL`);
            } else if (conditionObj.isDateColumn) {
                conditionClauses.push(`"${conditionObj.column}" >= $${index + 1}`);
                values.push(conditionObj.value);
            } else {
                conditionClauses.push(`"${conditionObj.column}" ${conditionObj.operator} $${index + 1}`);
                values.push(conditionObj.value);
            }
        });

        const selectClause = columnsToSelect.length > 0 ? columnsToSelect.map(column => `"${column}"`).join(', ') : '*';

        const whereClause = conditionClauses.length > 0 ? `WHERE ${conditionClauses.join(' AND ')}` : '';

        const sql = `SELECT ${selectClause} FROM "${tableName}" ${whereClause}`;




        pool.query(sql, values, (err, results) => {
            if (err) {
                logger.error(err);
                return reject(err);
            }

            return resolve(results);
        });
    });
};
servicedb.Create = (payload, table, returnfield) => {
    let columns = Object.keys(payload)
    let params = Object.values(payload)
    let fields = columns.toString()
    let values = prepareColumns(columns)
    let query = `INSERT INTO ${table} (${fields}) VALUES (${values}) RETURNING *`
    return new Promise((resolve, reject) => {
        pool.query(query, params, (err, results) => {
            if (err) {
                logger.error(err);
                return reject(err);
            }

            return resolve(results);
        });
    });
};




servicedb.Update = (values, table, fieldname, fiedlvalue) => {
    let columns = Object.keys(values);
    let params = [fiedlvalue];
    let query = `UPDATE ${table} SET `;
    for (let i = 0; i < columns.length; i++) {
        query = `${query}${columns[i]} = $${params.length + 1},`
        params.push(values[columns[i]]);
    }
    query = `${query.substring(0, query.length - 1)} WHERE ${fieldname} = $1 RETURNING *`

    return new Promise((resolve, reject) => {
        pool.query(query, params, (err, results) => {
            if (err) {
                logger.error(err);
                return reject(err);
            }

            return resolve(results);
        });
    });
};

module.exports = servicedb