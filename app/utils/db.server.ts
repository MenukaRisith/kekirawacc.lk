// app/utils/db.server.ts
import mysql from "mysql2/promise";

let pool: mysql.Pool;

declare global {
  // eslint-disable-next-line no-var
  var __dbPool: mysql.Pool | undefined;
}

function createPool() {
  return mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "kekirawacc",
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
  });
}

if (process.env.NODE_ENV === "production") {
  pool = createPool();
} else {
  // Reuse pool during dev to avoid too many connections
  if (!global.__dbPool) {
    global.__dbPool = createPool();
  }
  pool = global.__dbPool;
}

export { pool };
export type DbPool = mysql.Pool;
