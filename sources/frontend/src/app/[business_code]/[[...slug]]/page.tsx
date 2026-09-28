"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import { businessService, BusinessDetailResponse } from "@/services/businessService";

interface PageProps {
  params: Promise<{
    business_code: string;
    slug?: string[];
  }>;
}

const availableImages = [
  "/images/ring.jpg",
  "/images/necklace.jpg",
  "/images/gold_bar.jpg",
];

const cleanSegment = (val?: string): string => {
  if (!val) return "";
  try {
    const decoded = decodeURIComponent(val).trim();
    if (decoded === "-" || decoded === "_" || decoded === "--empty--") {
      return "";
    }
    return decoded;
  } catch {
    return val.trim();
  }
};

function parseSlugParams(slug: string[] = []) {
  let rawProductName = "";
  let rawGoldPurity = "";
  let rawTotalWeight = "";
  let rawStoneWeight = "";
  let rawProductCode = "";

  if (slug.length >= 5) {
    rawProductName = slug[0] || "";
    rawGoldPurity = slug[1] || "";
    rawTotalWeight = slug[2] || "";
    rawStoneWeight = slug[3] || "";
    rawProductCode = slug[4] || "";
  } else if (slug.length === 4) {
    // Trường hợp 4 tham số (có thể thiếu hàm lượng vàng hoặc thiếu trọng lượng đá)
    rawProductName = slug[0] || "";
    const hasDecimal = (s: string) => s.includes(".");
    if (hasDecimal(slug[1]) && hasDecimal(slug[2])) {
      // 2 số thập phân liên tiếp => slug[1] là tổng, slug[2] là đá, thiếu hàm lượng
      rawGoldPurity = "";
      rawTotalWeight = slug[1];
      rawStoneWeight = slug[2];
      rawProductCode = slug[3];
    } else {
      // Có hàm lượng vàng và trọng lượng tổng, thiếu trọng lượng đá
      rawGoldPurity = slug[1];
      rawTotalWeight = slug[2];
      rawStoneWeight = "";
      rawProductCode = slug[3];
    }
  } else if (slug.length === 3) {
    rawProductName = slug[0] || "";
    rawGoldPurity = slug[1] || "";
    rawTotalWeight = slug[2] || "";
  } else if (slug.length === 2) {
    rawProductName = slug[0] || "";
    rawGoldPurity = slug[1] || "";
  } else if (slug.length === 1) {
    rawProductName = slug[0] || "";
  }

  return {
    productName: cleanSegment(rawProductName),
    goldPurity: cleanSegment(rawGoldPurity),
    totalWeightStr: cleanSegment(rawTotalWeight),
    stoneWeightStr: cleanSegment(rawStoneWeight),
    productCode: cleanSegment(rawProductCode),
  };
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = React.use(params);

  const businessCode = resolvedParams.business_code;
  const rawSlug = resolvedParams.slug || [];

  const { productName, goldPurity, totalWeightStr, stoneWeightStr, productCode } =
    parseSlugParams(rawSlug);

  const hasTotalWeight = totalWeightStr !== "";
  const hasStoneWeight = stoneWeightStr !== "";

  const totalWeight = hasTotalWeight ? parseFloat(totalWeightStr) || 0 : 0;
  const stoneWeight = hasStoneWeight ? parseFloat(stoneWeightStr) || 0 : 0;

  const hasGoldWeight = hasTotalWeight;
  const goldWeight = hasGoldWeight ? Math.max(0, totalWeight - stoneWeight) : 0;

  // Không làm tròn cố định (1 chỉ = 3.75g)
  const formatExact = (num: number): string => {
    return parseFloat(num.toFixed(6)).toString();
  };

  const totalWeightDisplay = totalWeightStr;
  const stoneWeightDisplay = stoneWeightStr;
  const goldWeightDisplay = formatExact(goldWeight);

  const totalWeightGrams = formatExact(totalWeight * 3.75);
  const stoneWeightGrams = formatExact(stoneWeight * 3.75);
  const goldWeightGrams = formatExact(goldWeight * 3.75);

  // Random Image hoàn toàn độc lập trên mỗi lần tải trang
  const [productImgUrl, setProductImgUrl] = useState<string | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  useEffect(() => {
    const randImg = availableImages[Math.floor(Math.random() * availableImages.length)];
    setImgLoaded(false);
    setImgError(false);
    setProductImgUrl(randImg);
  }, []);

  // Khi productImgUrl thay đổi, kiểm tra nếu ảnh đã được cache sẵn
  // (trình duyệt sẽ không fire onLoad nếu src không đổi hoặc đã cached)
  useEffect(() => {
    if (!productImgUrl) return;
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      // Ảnh đã cached → onLoad sẽ không fire → set thủ công
      setImgLoaded(true);
    }
  }, [productImgUrl]);

  // Fetch thông tin doanh nghiệp qua API
  const [business, setBusiness] = useState<BusinessDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const businessId = parseInt(businessCode, 10);

    if (isNaN(businessId)) {
      setFetchError("Mã định danh doanh nghiệp không hợp lệ");
      setIsLoading(false);
      return;
    }

    businessService
      .getById(businessId)
      .then((data) => {
        if (!ignore) {
          if (data) {
            setBusiness(data);
          } else {
            setFetchError("Không tìm thấy thông tin doanh nghiệp");
          }
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Không thể tải thông tin doanh nghiệp";
          setFetchError(msg);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [businessCode]);

  return (
    <main className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans">
      {/* Studio Clean White Card */}
      <div className="bg-white border border-slate-200/80 overflow-hidden w-full min-h-screen flex flex-col">
        {/* Enterprise Header — skeleton khi đang tải, hiển thị thật khi có data */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-xs uppercase text-slate-900 tracking-wider">SADVN</span>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-semibold text-slate-500">Hệ thống tra cứu sản phẩm</span>
            </div>
            {isLoading ? (
              /* Skeleton tên doanh nghiệp */
              <div className="h-4 w-40 bg-slate-200 rounded animate-pulse mt-1" />
            ) : fetchError || !business ? (
              <h1 className="text-sm sm:text-base font-bold text-red-500 leading-snug">
                Không tìm thấy doanh nghiệp
              </h1>
            ) : (
              <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {business.name}
              </h1>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {isLoading ? (
              /* Skeleton MST */
              <div className="h-5 w-28 bg-slate-200 rounded animate-pulse" />
            ) : business?.taxCode ? (
              <span className="font-mono bg-slate-100 border border-slate-200/60 px-2.5 py-0.5 rounded text-[11px] font-semibold text-slate-700">
                MST: {business.taxCode}
              </span>
            ) : null}
            {!isLoading && business?.address && (
              <span className="hidden md:inline-block max-w-xs truncate text-[11px] text-slate-500" title={business.address}>
                {business.address}
              </span>
            )}
          </div>
        </div>

        {/* Content Body: Product Image & Spec Table — render ngay từ URL params */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 flex-1">
          {/* Left Column: Product Image (md:col-span-4) */}
          <div className="md:col-span-4 p-4 sm:p-5 flex flex-col items-center justify-center bg-slate-50/40 border-b md:border-b-0 md:border-r border-slate-100">
            <div className="relative w-full max-w-[220px] md:max-w-none aspect-[4/3] rounded-xl overflow-hidden border border-slate-200/70 shadow-2xs bg-slate-100">
              {/* Skeleton pulse khi ảnh đang tải */}
              {!imgLoaded && !imgError && (
                <div className="absolute inset-0 bg-slate-200 animate-pulse" />
              )}

              {/* Fallback khi ảnh lỗi */}
              {imgError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                  <svg className="w-10 h-10 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[10px] font-medium">Không tải được ảnh</span>
                </div>
              )}

              {/* Ảnh thật — chỉ render khi đã có URL, dùng ref để detect cached */}
              {productImgUrl && (
                <img
                  ref={imgRef}
                  key={productImgUrl}
                  src={productImgUrl}
                  alt={productName || "Sản phẩm"}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded && !imgError ? "opacity-100" : "opacity-0"}`}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => { setImgLoaded(true); setImgError(true); }}
                />
              )}

              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                {productCode ? (
                  <span
                    className="bg-black/70 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded"
                    style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
                  >
                    #{productCode}
                  </span>
                ) : <span />}
                {goldPurity ? (
                  <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                    {goldPurity}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Right Column: Specification Table (md:col-span-8) */}
          <div className="md:col-span-8 p-4 sm:p-5 flex flex-col justify-between space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-collapse border-slate-200/80 rounded-xl overflow-hidden">
                <tbody className="divide-y divide-slate-100">
                  {/* Row 1: Tên sản phẩm */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="w-2/5 px-3.5 py-2.5 font-medium text-slate-500 bg-slate-50/60 border-r border-slate-100">
                      Tên sản phẩm
                    </td>
                    <td className="w-3/5 px-3.5 py-2.5 font-bold text-slate-900 text-sm">
                      {productName}
                    </td>
                  </tr>

                  {/* Row 2: Mã sản phẩm */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3.5 py-2 font-medium text-slate-500 bg-slate-50/60 border-r border-slate-100">
                      Mã sản phẩm
                    </td>
                    <td className="px-3.5 py-2 font-mono font-bold text-slate-800">
                      {productCode}
                    </td>
                  </tr>

                  {/* Row 3: Hàm lượng vàng */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3.5 py-2 font-medium text-slate-500 bg-slate-50/60 border-r border-slate-100">
                      Hàm lượng vàng
                    </td>
                    <td className="px-3.5 py-2 font-bold text-slate-800">
                      {goldPurity}
                    </td>
                  </tr>

                  {/* Row 4: Trọng lượng tổng */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3.5 py-2 font-medium text-slate-500 bg-slate-50/60 border-r border-slate-100">
                      Trọng lượng tổng
                    </td>
                    <td className="px-3.5 py-2 font-bold font-mono text-slate-800">
                      {hasTotalWeight ? (
                        <>
                          {totalWeightDisplay} chỉ{" "}
                          <span className="font-sans font-normal text-[11px] text-slate-500">
                            ({totalWeightGrams} g)
                          </span>
                        </>
                      ) : null}
                    </td>
                  </tr>

                  {/* Row 5: Trọng lượng đá */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3.5 py-2 font-medium text-slate-500 bg-slate-50/60 border-r border-slate-100">
                      Trọng lượng đá
                    </td>
                    <td className="px-3.5 py-2 font-bold font-mono text-slate-800">
                      {hasStoneWeight ? (
                        <>
                          {stoneWeightDisplay} chỉ{" "}
                          <span className="font-sans font-normal text-[11px] text-slate-500">
                            ({stoneWeightGrams} g)
                          </span>
                        </>
                      ) : null}
                    </td>
                  </tr>

                  {/* Row 6 (Hero Highlight): Trọng lượng vàng */}
                  <tr className="bg-slate-100/90 font-bold">
                    <td className="px-3.5 py-2.5 text-slate-800 border-r border-slate-200/80">
                      <span className="block font-bold">Trọng lượng vàng</span>
                      <span className="text-[10px] font-normal text-slate-500 block">
                        (Tổng − Đá)
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-900">
                      {hasGoldWeight ? (
                        <>
                          <span className="text-base sm:text-lg font-black font-mono tracking-tight text-slate-950">
                            {goldWeightDisplay}
                          </span>
                          <span className="text-xs font-bold uppercase ml-1 text-slate-700">chỉ</span>
                          <span className="font-sans font-normal text-xs text-slate-500 ml-1.5">
                            ({goldWeightGrams} g)
                          </span>
                        </>
                      ) : null}
                    </td>
                  </tr>

                  {/* Row 7: Mã ký hiệu (để cuối) */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3.5 py-2 font-medium text-slate-500 bg-slate-50/60 border-r border-slate-100">
                      Mã ký hiệu
                    </td>
                    <td className="px-3.5 py-2 font-semibold text-slate-700 italic">
                      Được khắc trên sản phẩm
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-400 font-medium">
              © 2026 by sadvn
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
