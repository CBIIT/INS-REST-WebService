/**
 * MySQL client
 */

"use strict";
const config = require("../Config");
const mysql = require("mysql");
const { promisify } = require("util");

let pool = null;

if (config.mysql.host) {
    pool = mysql.createPool({
        connectionLimit: config.mysql.connectionLimit,
        connectTimeout: config.mysql.connectTimeout || (1000 * 60 * 20),
        acquireTimeout: config.mysql.acquireTimeout || (1000 * 60 * 20),
        host: config.mysql.host,
        user: config.mysql.user,
        password: config.mysql.password,
        database: config.mysql.db,
        multipleStatements: true,
        debug: false
    });

    pool.getConnectionAsync = () => {
        return new Promise((resolve, reject) => {
            pool.getConnection((error, connection) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(connection);
                }
            });
        });
    };

    pool.query = promisify(pool.query).bind(pool);

    pool.format = (sql, inserts) => {
        return mysql.format(sql, inserts);
    };

    pool.close = () => {
        if (pool) {
            pool.end();
        }
    };
}

module.exports = pool;
