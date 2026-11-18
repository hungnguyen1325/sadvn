"use server";

import { getBangGiaVangPool, getSadVietNamPool, sql } from "@/lib/db";
import type { Customer, MultiDbStats } from "@/services/customerService";

export async function searchCustomersAction(
  rawQuery: string = "",
  source: string = "ALL",
  limit: number = 5000
): Promise<Customer[]> {
  const query = rawQuery.trim();
  const wildcard = `%${query}%`;
  const maxLimit = Math.min(Math.max(limit, 1), 5000);
  const targetSource = (source || "ALL").trim();

  const results: Customer[] = [];
  const promises: Promise<void>[] = [];

  // 1. Tìm kiếm trong BangGiaVang
  if (targetSource === "ALL" || targetSource.toLowerCase() === "banggiavang") {
    promises.push(
      (async () => {
        try {
          const pool = await getBangGiaVangPool();
          const querySql = `
            SELECT TOP (@limit)
                s.[id], s.[shopTitle], s.[shopSubTitle], s.[shopSubTitle2],
                s.[phoneNumber1], s.[phoneNumber2], s.[phoneNumber3],
                s.[logoImageUrl], s.[status],
                a.[username], a.[fullname]
            FROM [ShopsTbl] s
            LEFT JOIN [AccountsTbl] a ON a.[idShop] = s.[id]
            WHERE (@query = ''
               OR s.[shopTitle] LIKE @wildcard
               OR s.[shopSubTitle] LIKE @wildcard
               OR s.[shopSubTitle2] LIKE @wildcard
               OR s.[phoneNumber1] LIKE @wildcard
               OR s.[phoneNumber2] LIKE @wildcard
               OR s.[phoneNumber3] LIKE @wildcard
               OR a.[username] LIKE @wildcard
               OR a.[fullname] LIKE @wildcard)
            ORDER BY s.[id] DESC
          `;

          const res = await pool
            .request()
            .input("limit", sql.Int, maxLimit)
            .input("query", sql.NVarChar(200), query)
            .input("wildcard", sql.NVarChar(200), wildcard)
            .query(querySql);

          for (const row of res.recordset) {
            const id = row.id;
            const shopTitle = row.shopTitle?.trim() || "";
            const fullname = row.fullname?.trim() || "";
            const username = row.username?.trim() || "";
            const name = shopTitle || fullname || (username ? `Tiệm (${username})` : `Tiệm #${id}`);

            const phones = [row.phoneNumber1, row.phoneNumber2, row.phoneNumber3]
              .map((p) => (p ? String(p).trim() : ""))
              .filter((p, idx, arr) => p && arr.indexOf(p) === idx);

            const addresses = [row.shopSubTitle, row.shopSubTitle2]
              .map((a) => (a ? String(a).trim() : ""))
              .filter((a, idx, arr) => a && arr.indexOf(a) === idx);

            const isActive = row.status === null || row.status === undefined || Boolean(row.status);

            results.push({
              id: `BGV-${id}`,
              code: username || `SHOP-${id}`,
              name,
              phone: phones.join(" - "),
              email: "",
              address: addresses.join(", "),
              source: "BangGiaVang",
              sourceLabel: "Bảng Giá Vàng",
              customerType: "enterprise",
              tier: "VIP",
              status: isActive ? "active" : "inactive",
              roleOrDesc: username ? `Tài khoản: ${username}` : "Tiệm vàng BGV",
              avatar: row.logoImageUrl || undefined,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error("SQL search BangGiaVang error:", err);
        }
      })()
    );
  }

  // 2. Tìm kiếm trong SADVietNam
  if (targetSource === "ALL" || targetSource.toLowerCase() === "sadvietnam") {
    promises.push(
      (async () => {
        try {
          const pool = await getSadVietNamPool();
          const querySql = `
            SELECT TOP (@limit)
                [DoiTacID], [Code], [DoiTacName], [DoiTacAdd], [DoiTacTel], [DoiTacEmail], [Kh_yn], [Status], [datetime0]
            FROM [dmdoitac]
            WHERE (@query = ''
               OR [DoiTacID] LIKE @wildcard
               OR [Code] LIKE @wildcard
               OR [DoiTacName] LIKE @wildcard
               OR [DoiTacTel] LIKE @wildcard
               OR [DoiTacAdd] LIKE @wildcard
               OR [DoiTacEmail] LIKE @wildcard)
            ORDER BY [DoiTacID] DESC
          `;

          const res = await pool
            .request()
            .input("limit", sql.Int, maxLimit)
            .input("query", sql.NVarChar(200), query)
            .input("wildcard", sql.NVarChar(200), wildcard)
            .query(querySql);

          for (const row of res.recordset) {
            const doiTacId = row.DoiTacID ? String(row.DoiTacID).trim() : "";
            const code = row.Code ? String(row.Code).trim() : doiTacId;
            const isKh = row.Kh_yn === 1;
            const statusStr = row.Status ? String(row.Status).trim() : "";
            const isActive = !statusStr || statusStr === "1" || statusStr.toUpperCase() === "A";

            results.push({
              id: `SAD-${doiTacId || code}`,
              code,
              name: row.DoiTacName ? String(row.DoiTacName).trim() : `Đối tác #${doiTacId}`,
              phone: row.DoiTacTel ? String(row.DoiTacTel).trim() : "",
              email: row.DoiTacEmail ? String(row.DoiTacEmail).trim() : "",
              address: row.DoiTacAdd ? String(row.DoiTacAdd).trim() : "",
              source: "SADVietNam",
              sourceLabel: "SAD Việt Nam",
              customerType: "enterprise",
              tier: isKh ? "VIP" : "Đối tác",
              status: isActive ? "active" : "inactive",
              roleOrDesc: isKh ? "Khách hàng mua sắm" : "Đối tác doanh nghiệp",
              createdAt: row.datetime0 ? new Date(row.datetime0).toISOString() : new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error("SQL search SADVietNam error:", err);
        }
      })()
    );
  }

  await Promise.all(promises);
  return results;
}

export async function getCustomerStatsAction(): Promise<MultiDbStats> {
  let bgvCount = 0;
  let sadCount = 0;
  const activeSources: string[] = [];

  try {
    const bgvPool = await getBangGiaVangPool();
    const res = await bgvPool.request().query("SELECT COUNT(*) AS c FROM [ShopsTbl]");
    if (res.recordset && res.recordset.length > 0) {
      bgvCount = Number(res.recordset[0].c);
      activeSources.push("BangGiaVang");
    }
  } catch (err) {
    console.error("SQL getCustomerStatsAction BangGiaVang error:", err);
  }

  try {
    const sadPool = await getSadVietNamPool();
    const res = await sadPool.request().query("SELECT COUNT(*) AS c FROM [dmdoitac]");
    if (res.recordset && res.recordset.length > 0) {
      sadCount = Number(res.recordset[0].c);
      activeSources.push("SADVietNam");
    }
  } catch (err) {
    console.error("SQL getCustomerStatsAction SADVietNam error:", err);
  }

  return {
    totalBangGiaVang: bgvCount,
    totalSadVietNam: sadCount,
    totalDb3: 0,
    totalAll: bgvCount + sadCount,
    activeSources: activeSources.length > 0 ? activeSources : ["BangGiaVang", "SADVietNam"],
  };
}
