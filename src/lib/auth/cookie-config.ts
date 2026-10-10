export const ACCESS_TOKEN_COOKIE = "accessToken";
export const REFRESH_TOKEN_COOKIE = "refreshToken";

export const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24;
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

/**
 * Holds the email being verified or reset between the two OTP steps. Short
 * lived so a stale registration cannot be completed much later.
 */
export const PENDING_EMAIL_COOKIE = "es_pending_email";
export const PENDING_EMAIL_MAX_AGE = 60 * 15;

export interface AuthCookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge: number;
}

export function authCookieOptions(maxAge: number): AuthCookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}
