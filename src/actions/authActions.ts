"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getSadvnPool, sql } from "@/lib/db";

export interface LoginResult {
  token: string;
  username: string;
}

function createJwt(username: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 ngày
  const payload = { sub: username, username, exp, iss: "sadvn.vn" };

  const encodeBase64Url = (input: string | object) => {
    const str = typeof input === "string" ? input : JSON.stringify(input);
    return Buffer.from(str)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const headerB64 = encodeBase64Url(header);
  const payloadB64 = encodeBase64Url(payload);
  const secret = process.env.JWT_SECRET || "sadvn_secret_signing_key_production";
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${headerB64}.${payloadB64}.${signature}`;
}

export async function loginAction(usernameInput: string, passwordInput: string): Promise<LoginResult> {
  const username = usernameInput.trim();
  const password = passwordInput.trim();

  if (!username) {
    throw new Error("Vui lòng nhập tên đăng nhập");
  }
  if (!password) {
    throw new Error("Vui lòng nhập mật khẩu");
  }

  try {
    const pool = await getSadvnPool();
    const result = await pool
      .request()
      .input("username", sql.VarChar(50), username)
      .query(`
        SELECT [id], [username], [password]
        FROM [accounts]
        WHERE [username] = @username
      `);

    if (result.recordset && result.recordset.length > 0) {
      const account = result.recordset[0];
      const dbHash = String(account.password);

      const isMatch = bcrypt.compareSync(password, dbHash);
      if (isMatch) {
        return {
          token: createJwt(account.username),
          username: account.username,
        };
      }
    }
  } catch (err) {
    console.error("SQL loginAction error:", err);
    throw new Error("Lỗi kết nối cơ sở dữ liệu khi xác thực");
  }

  throw new Error("Tên đăng nhập hoặc mật khẩu không chính xác");
}
