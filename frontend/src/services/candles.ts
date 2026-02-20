import api from "../api/axiosInstance";
import type { Candle, Category } from "../types/candle";

export type CandleListParams = {
  search?: string;
  ordering?: "price" | "-price" | "created_at" | "-created_at" | "name" | "-name";
  category?: number;
  in_stock?: boolean;
};

function toQuery(params?: CandleListParams): Record<string, string> {
  const q: Record<string, string> = {};
  if (!params) return q;

  if (params.search) q.search = params.search;
  if (params.ordering) q.ordering = params.ordering;
  if (typeof params.category === "number") q.category = String(params.category);
  if (typeof params.in_stock === "boolean") q.in_stock = params.in_stock ? "true" : "false";

  return q;
}

export async function listCandles(params?: CandleListParams): Promise<Candle[]> {
  const resp = await api.get<Candle[]>("/candles/candles/", { params: toQuery(params) });
  return resp.data;
}

export async function getCandleBySlug(slug: string): Promise<Candle> {
  const safe = String(slug).trim();
  const resp = await api.get<Candle>(`/candles/candles/${encodeURIComponent(safe)}/`);
  return resp.data;
}

export async function listCategories(): Promise<Category[]> {
  const resp = await api.get<Category[]>("/candles/categories/");
  return resp.data;
}

export async function createCandle(payload: FormData): Promise<Candle> {
  const resp = await api.post<Candle>("/candles/candles/", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return resp.data;
}

export async function updateCandle(slug: string, payload: FormData): Promise<Candle> {
  const safe = String(slug).trim();
  const resp = await api.put<Candle>(`/candles/candles/${encodeURIComponent(safe)}/`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return resp.data;
}

export async function patchCandle(slug: string, payload: Partial<Record<string, unknown>>): Promise<Candle> {
  const safe = String(slug).trim();
  const resp = await api.patch<Candle>(`/candles/candles/${encodeURIComponent(safe)}/`, payload);
  return resp.data;
}

export async function deleteCandle(slug: string): Promise<void> {
  const safe = String(slug).trim();
  await api.delete(`/candles/candles/${encodeURIComponent(safe)}/`);
}