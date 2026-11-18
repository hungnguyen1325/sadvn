"use server";

import { getSadvnPool, sql } from "@/lib/db";
import type { Business, BusinessDetailResponse } from "@/services/businessService";

export interface CreateBusinessInput {
  name: string;
  taxCode: string;
  address?: string;
}

export interface UpdateBusinessInput {
  id: number;
  name: string;
  taxCode: string;
  address?: string;
  active?: boolean;
}

export async function getBusinessByIdAction(id: number): Promise<BusinessDetailResponse | null> {
  try {
    const pool = await getSadvnPool();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        SELECT [name], [tax_code] AS taxCode, [address]
        FROM [business]
        WHERE [id] = @id
      `);

    if (result.recordset && result.recordset.length > 0) {
      const row = result.recordset[0];
      return {
        name: row.name,
        taxCode: row.taxCode,
        address: row.address || "",
      };
    }
  } catch (err) {
    console.error("SQL getBusinessByIdAction error:", err);
  }
  return null;
}

export async function getAllBusinessesAction(): Promise<Business[]> {
  try {
    const pool = await getSadvnPool();
    const result = await pool.request().query(`
      SELECT 
        [id],
        CAST([uuid] AS VARCHAR(36)) AS [uuid],
        [name],
        [tax_code] AS taxCode,
        [address],
        [is_active] AS isActive,
        [create_at] AS createAt,
        [update_at] AS updateAt
      FROM [business]
      ORDER BY [id] DESC
    `);

    if (result.recordset && result.recordset.length > 0) {
      return result.recordset.map((row) => ({
        id: Number(row.id),
        uuid: String(row.uuid),
        name: String(row.name),
        taxCode: String(row.taxCode),
        address: row.address ? String(row.address) : "",
        isActive: Boolean(row.isActive),
        createAt: row.createAt ? new Date(row.createAt).toISOString() : undefined,
        updateAt: row.updateAt ? new Date(row.updateAt).toISOString() : undefined,
      }));
    }
  } catch (err) {
    console.error("SQL getAllBusinessesAction error:", err);
  }
  return [];
}

export async function searchBusinessesAction(params: { name?: string; taxCode?: string; address?: string }): Promise<Business[]> {
  try {
    const pool = await getSadvnPool();
    const nameWildcard = `%${(params.name || "").trim()}%`;
    const taxWildcard = `%${(params.taxCode || "").trim()}%`;
    const addrWildcard = `%${(params.address || "").trim()}%`;

    const result = await pool
      .request()
      .input("name", sql.NVarChar(255), nameWildcard)
      .input("taxCode", sql.VarChar(20), taxWildcard)
      .input("address", sql.NVarChar(255), addrWildcard)
      .query(`
        SELECT 
          [id],
          CAST([uuid] AS VARCHAR(36)) AS [uuid],
          [name],
          [tax_code] AS taxCode,
          [address],
          [is_active] AS isActive,
          [create_at] AS createAt,
          [update_at] AS updateAt
        FROM [business]
        WHERE (@name = '%%' OR [name] LIKE @name)
          AND (@taxCode = '%%' OR [tax_code] LIKE @taxCode)
          AND (@address = '%%' OR [address] LIKE @address)
        ORDER BY [id] DESC
      `);

    return result.recordset.map((row) => ({
      id: Number(row.id),
      uuid: String(row.uuid),
      name: String(row.name),
      taxCode: String(row.taxCode),
      address: row.address ? String(row.address) : "",
      isActive: Boolean(row.isActive),
      createAt: row.createAt ? new Date(row.createAt).toISOString() : undefined,
      updateAt: row.updateAt ? new Date(row.updateAt).toISOString() : undefined,
    }));
  } catch (err) {
    console.error("SQL searchBusinessesAction error:", err);
    return [];
  }
}

export async function createBusinessAction(data: CreateBusinessInput): Promise<Business> {
  try {
    const pool = await getSadvnPool();
    const result = await pool
      .request()
      .input("name", sql.NVarChar(255), data.name.trim())
      .input("taxCode", sql.VarChar(20), data.taxCode.trim())
      .input("address", sql.NVarChar(255), data.address?.trim() || null)
      .input("isActive", sql.Bit, true)
      .query(`
        INSERT INTO [business] ([name], [tax_code], [address], [is_active])
        OUTPUT 
          INSERTED.[id],
          CAST(INSERTED.[uuid] AS VARCHAR(36)) AS [uuid],
          INSERTED.[name],
          INSERTED.[tax_code] AS taxCode,
          INSERTED.[address],
          INSERTED.[is_active] AS isActive,
          INSERTED.[create_at] AS createAt,
          INSERTED.[update_at] AS updateAt
        VALUES (@name, @taxCode, @address, @isActive)
      `);

    const row = result.recordset[0];
    return {
      id: Number(row.id),
      uuid: String(row.uuid),
      name: String(row.name),
      taxCode: String(row.taxCode),
      address: row.address ? String(row.address) : "",
      isActive: Boolean(row.isActive),
      createAt: row.createAt ? new Date(row.createAt).toISOString() : new Date().toISOString(),
      updateAt: row.updateAt ? new Date(row.updateAt).toISOString() : new Date().toISOString(),
    };
  } catch (err) {
    console.error("SQL createBusinessAction error:", err);
    throw new Error(err instanceof Error ? err.message : "Không thể tạo doanh nghiệp trong cơ sở dữ liệu");
  }
}

export async function updateBusinessAction(data: UpdateBusinessInput): Promise<Business> {
  try {
    const pool = await getSadvnPool();
    const result = await pool
      .request()
      .input("id", sql.Int, data.id)
      .input("name", sql.NVarChar(255), data.name.trim())
      .input("taxCode", sql.VarChar(20), data.taxCode.trim())
      .input("address", sql.NVarChar(255), data.address?.trim() || null)
      .input("isActive", sql.Bit, data.active !== undefined ? (data.active ? 1 : 0) : 1)
      .query(`
        UPDATE [business]
        SET 
          [name] = @name,
          [tax_code] = @taxCode,
          [address] = @address,
          [is_active] = @isActive,
          [update_at] = SYSUTCDATETIME()
        OUTPUT 
          INSERTED.[id],
          CAST(INSERTED.[uuid] AS VARCHAR(36)) AS [uuid],
          INSERTED.[name],
          INSERTED.[tax_code] AS taxCode,
          INSERTED.[address],
          INSERTED.[is_active] AS isActive,
          INSERTED.[create_at] AS createAt,
          INSERTED.[update_at] AS updateAt
        WHERE [id] = @id
      `);

    if (!result.recordset || result.recordset.length === 0) {
      throw new Error("Không tìm thấy doanh nghiệp có ID: " + data.id);
    }

    const row = result.recordset[0];
    return {
      id: Number(row.id),
      uuid: String(row.uuid),
      name: String(row.name),
      taxCode: String(row.taxCode),
      address: row.address ? String(row.address) : "",
      isActive: Boolean(row.isActive),
      createAt: row.createAt ? new Date(row.createAt).toISOString() : undefined,
      updateAt: row.updateAt ? new Date(row.updateAt).toISOString() : undefined,
    };
  } catch (err) {
    console.error("SQL updateBusinessAction error:", err);
    throw new Error(err instanceof Error ? err.message : "Không thể cập nhật doanh nghiệp trong cơ sở dữ liệu");
  }
}

export async function deleteBusinessAction(id: number): Promise<string> {
  try {
    const pool = await getSadvnPool();
    await pool
      .request()
      .input("id", sql.Int, id)
      .query(`DELETE FROM [business] WHERE [id] = @id`);
    return "Đã xóa doanh nghiệp thành công";
  } catch (err) {
    console.error("SQL deleteBusinessAction error:", err);
    throw new Error(err instanceof Error ? err.message : "Không thể xóa doanh nghiệp");
  }
}
