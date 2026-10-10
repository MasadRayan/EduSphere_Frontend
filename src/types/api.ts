export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaymentsSummary {
  revenue: number;
  refunded: number;
}

export interface PaymentsMeta extends PaginationMeta {
  summary: PaymentsSummary;
}

export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginationMeta | PaymentsMeta;
}

export type ActionResult<T = null> =
  | { ok: true; message: string; data: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
