import sql from "mssql";

function getSadvnConfig(): sql.config {
  const host = process.env.DATABASE_HOST;
  const user = process.env.DATABASE_USER;
  const password = process.env.DATABASE_PASSWORD;
  const database = process.env.DATABASE_NAME;

  if (!host || !user || !password || !database) {
    throw new Error("Missing required database configuration in environment variables (DATABASE_HOST, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME)");
  }

  return {
    user,
    password,
    server: host,
    port: Number(process.env.DATABASE_PORT) || 1433,
    database,
    options: {
      encrypt: process.env.DATABASE_ENCRYPT === "true",
      trustServerCertificate: true,
    },
    pool: {
      max: Number(process.env.DATABASE_MAXPOOL) || 15,
      min: Number(process.env.DATABASE_MINPOOL) || 2,
      idleTimeoutMillis: 30000,
    },
  };
}

function getBangGiaVangConfig(): sql.config {
  const host = process.env.CUSTOMER_DB_HOST || process.env.DATABASE_HOST;
  const user = process.env.CUSTOMER_DB_USER || process.env.DATABASE_USER;
  const password = process.env.CUSTOMER_DB_PASSWORD || process.env.DATABASE_PASSWORD;
  const database = process.env.CUSTOMER_DB1_NAME || "BangGiaVang";

  if (!host || !user || !password) {
    throw new Error("Missing required customer database configuration (CUSTOMER_DB_HOST, CUSTOMER_DB_USER, CUSTOMER_DB_PASSWORD)");
  }

  return {
    user,
    password,
    server: host,
    port: Number(process.env.CUSTOMER_DB_PORT) || Number(process.env.DATABASE_PORT) || 1433,
    database,
    options: {
      encrypt: process.env.CUSTOMER_DB_ENCRYPT === "true",
      trustServerCertificate: true,
    },
    pool: {
      max: 10,
      min: 1,
      idleTimeoutMillis: 30000,
    },
  };
}

function getSadVietNamConfig(): sql.config {
  const host = process.env.CUSTOMER_DB_HOST || process.env.DATABASE_HOST;
  const user = process.env.CUSTOMER_DB_USER || process.env.DATABASE_USER;
  const password = process.env.CUSTOMER_DB_PASSWORD || process.env.DATABASE_PASSWORD;
  const database = process.env.CUSTOMER_DB2_NAME || "SADVietNam";

  if (!host || !user || !password) {
    throw new Error("Missing required customer database configuration (CUSTOMER_DB_HOST, CUSTOMER_DB_USER, CUSTOMER_DB_PASSWORD)");
  }

  return {
    user,
    password,
    server: host,
    port: Number(process.env.CUSTOMER_DB_PORT) || Number(process.env.DATABASE_PORT) || 1433,
    database,
    options: {
      encrypt: process.env.CUSTOMER_DB_ENCRYPT === "true",
      trustServerCertificate: true,
    },
    pool: {
      max: 10,
      min: 1,
      idleTimeoutMillis: 30000,
    },
  };
}

interface GlobalPools {
  sadvnPool?: sql.ConnectionPool;
  bgvPool?: sql.ConnectionPool;
  sadPool?: sql.ConnectionPool;
}

const globalForDb = globalThis as unknown as { __mssql_pools?: GlobalPools };
if (!globalForDb.__mssql_pools) {
  globalForDb.__mssql_pools = {};
}

export async function getSadvnPool(): Promise<sql.ConnectionPool> {
  if (globalForDb.__mssql_pools?.sadvnPool?.connected) {
    return globalForDb.__mssql_pools.sadvnPool;
  }
  const config = getSadvnConfig();
  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  if (globalForDb.__mssql_pools) {
    globalForDb.__mssql_pools.sadvnPool = pool;
  }
  return pool;
}

export async function getBangGiaVangPool(): Promise<sql.ConnectionPool> {
  if (globalForDb.__mssql_pools?.bgvPool?.connected) {
    return globalForDb.__mssql_pools.bgvPool;
  }
  const config = getBangGiaVangConfig();
  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  if (globalForDb.__mssql_pools) {
    globalForDb.__mssql_pools.bgvPool = pool;
  }
  return pool;
}

export async function getSadVietNamPool(): Promise<sql.ConnectionPool> {
  if (globalForDb.__mssql_pools?.sadPool?.connected) {
    return globalForDb.__mssql_pools.sadPool;
  }
  const config = getSadVietNamConfig();
  const pool = new sql.ConnectionPool(config);
  await pool.connect();
  if (globalForDb.__mssql_pools) {
    globalForDb.__mssql_pools.sadPool = pool;
  }
  return pool;
}

export { sql };
