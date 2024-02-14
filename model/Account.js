const pool = require("../config/db");
const { logger } = require("../logs/winston");

let compdb = {};


compdb.dealerAuthModel = (username) => {
    return new Promise((resolve, reject) => {
        pool.query(

            `
            SELECT DISTINCT
			userinfo.user_id,
            userinfo.*,
			tenant.*
    FROM
                  users userinfo
                  INNER JOIN tenants tenant ON userinfo.tenant_id  = tenant.tenant_id
                  WHERE userinfo.username = $1
            `

            , [username], (err, results) => {
                if (err) {
                    logger.error(err);
                    return reject(err);
                }

                return resolve(results);
            });
    });
};
compdb.findUserRoleModel = (username) => {
    return new Promise((resolve, reject) => {
        pool.query(

            `
            SELECT DISTINCT
            ur.role_id,
            r.role_name
    FROM
    user_roles ur
                  INNER JOIN roles r ON ur.role_id  = r.role_id
                  WHERE ur.user_id = $1
            `

            , [username], (err, results) => {
                if (err) {
                    logger.error(err);
                    return reject(err);
                }

                return resolve(results);
            });
    });
};
compdb.findUserPermissionModel = (username) => {
    return new Promise((resolve, reject) => {
        pool.query(

            `
            SELECT
    p.permission_id,
    p.permission_name
FROM
    users u
    INNER JOIN user_roles ur ON u.user_id = ur.user_id
    INNER JOIN roles r ON ur.role_id = r.role_id
    INNER JOIN role_permissions rp ON r.role_id = rp.role_id
    INNER JOIN permissions p ON rp.permission_id = p.permission_id
WHERE
    u.user_id = $1
            `

            , [username], (err, results) => {
                if (err) {
                    logger.error(err);
                    return reject(err);
                }

                return resolve(results);
            });
    });
};
compdb.adminAuthModel = (username) => {
    return new Promise((resolve, reject) => {
        pool.query(

            `SELECT *
            FROM users
            WHERE username = $1 OR email = $1  OR phone_number = $1
            `

            , [username], (err, results) => {
                if (err) {
                    logger.error(err);
                    return reject(err);
                }

                return resolve(results);
            });
    });
};

compdb.ShowRolePermissions = (role_id) => {
    return new Promise((resolve, reject) => {
        pool.query(

            `
            SELECT
            rp.role_permission_id,
            p.permission_id,
            p.permission_name
        FROM
            roles r
            INNER JOIN role_permissions rp ON r.role_id = rp.role_id
            INNER JOIN permissions p ON rp.permission_id = p.permission_id
            WHERE rp.role_id = $1
        
            `

            , [role_id], (err, results) => {
                if (err) {
                    logger.error(err);
                    return reject(err);
                }

                return resolve(results);
            });
    });
};
compdb.verifyPermission = (user_id,routes_path,routes_method) => {
    return new Promise((resolve, reject) => {
        pool.query(

            `
            SELECT p.permission_name AS permission, r.routes_path, r.routes_method
            FROM permissions p
            JOIN role_permissions rp ON p.permission_id = rp.permission_id
            JOIN roles ro ON rp.role_id = ro.role_id
            JOIN user_roles ur ON ro.role_id = ur.role_id
            JOIN routes r ON p.permission_id = r.permission_id
            WHERE ur.user_id = $1 AND r.routes_path = $2 AND r.routes_method = $3
        
            `

            , [user_id,routes_path,routes_method], (err, results) => {
                if (err) {
                    logger.error(err);
                    return reject(err);
                }

                return resolve(results);
            });
    });
};


module.exports = compdb