export const ElementsPerPage = 20;

export const init = `CREATE TABLE IF NOT EXISTS reports (
uuid TEXT NOT NULL PRIMARY KEY,
time INT NOT NULL,
path TEXT NOT NULL,
ua TEXT NOT NULL,
ip TEXT NOT NULL,
fields TEXT NOT NULL
)`;

export const write = `INSERT INTO reports (uuid, time, path, ua, ip, fields) VALUES ($uuid, $time, $path, $ua, $ip, $fields)`;

export const getAll = `SELECT DISTINCT time, uuid, fields FROM reports ORDER BY time LIMIT ${ElementsPerPage} OFFSET $offset;`;

export const getSpecific = `SELECT DISTINCT time, uuid, fields FROM reports WHERE uuid = $uuid;`;

export const getAmountPages = `SELECT COUNT(*) AS output FROM reports;`;
