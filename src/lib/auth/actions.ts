"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";
import { ApiError } from "@/lib/api/errors";
import { setFlash } from "@/lib/flash";
import type { ActionResult } from "@/types/api";
import {
  authCookieOptions,
  PENDING_EMAIL_COOKIE,
  PENDING_EMAIL_MAX_AGE,
} from "./cookie-config";
import { clearAuthCookies, setAuthCookies } from "./cookies";
import { decodeRoleFromAccessToken } from "./jwt";
import { friendlyAuthMessage } from "./messages";
import { safeNext } from "./redirects";
import { homePathForRole } from "./role-paths";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./schemas";
import {
  forgotPassword,
  googleLogin,
  login,
  register,
  resetPassword,
  verifyEmail,
} from "./service";

type FormState = ActionResult<null> | undefined;

function fieldErrorsFrom(error: ZodError): Record<string, string[]> {
  const flat = error.flatten().fieldErrors;
  const result: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(flat)) {
    if (value?.length) {
      result[key] = value;
    }
  }
  return result;
}

function messageFrom(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.kind === "network") {
      return error.message;
    }
    return friendlyAuthMessage(error.message, fallback);
  }
  return fallback;
}

function readString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  const parsed = registerSchema.safeParse({
    name: readString(formData.get("name")),
    email: readString(formData.get("email")),
    password: readString(formData.get("password")),
    role: readString(formData.get("role")) || "STUDENT",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the details below and try again.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    await register(parsed.data);
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not create your account. Please try again.",
      ),
    };
  }

  const store = await cookies();
  store.set(
    PENDING_EMAIL_COOKIE,
    parsed.data.email,
    authCookieOptions(PENDING_EMAIL_MAX_AGE),
  );
  setFlash(store, {
    type: "success",
    message: "Account created",
    description: "Enter the 6-digit code we emailed you.",
  });
  redirect("/verify-email");
}

export async function verifyEmailAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  const parsed = verifyEmailSchema.safeParse({
    email: readString(formData.get("email")),
    otp: readString(formData.get("otp")),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the code below and try again.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  let payload: Awaited<ReturnType<typeof verifyEmail>>;
  try {
    payload = await verifyEmail(parsed.data);
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not verify that code. Please try again.",
      ),
    };
  }

  const store = await cookies();
  setAuthCookies(store, {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  });
  store.delete(PENDING_EMAIL_COOKIE);

  setFlash(store, {
    type: "success",
    message: "Email verified",
    description: "Welcome to EduSphere.",
  });

  const next = safeNext(readString(formData.get("next")));
  redirect(next ?? homePathForRole(payload.user.role));
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  const parsed = loginSchema.safeParse({
    email: readString(formData.get("email")),
    password: readString(formData.get("password")),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check your email and password and try again.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  let tokens: Awaited<ReturnType<typeof login>>;
  try {
    tokens = await login(parsed.data);
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not log you in. Check your details and try again.",
      ),
    };
  }

  const store = await cookies();
  setAuthCookies(store, tokens);

  setFlash(store, {
    type: "success",
    message: "Signed in successfully",
    description: "Welcome back to EduSphere.",
  });

  const role = decodeRoleFromAccessToken(tokens.accessToken);
  const next = safeNext(readString(formData.get("next")));
  redirect(next ?? (role ? homePathForRole(role) : "/"));
}

export async function googleLoginAction(
  idToken: string,
  next?: string | null,
): Promise<ActionResult<null>> {
  const token = idToken.trim();
  if (!token) {
    return { ok: false, message: "Google sign-in did not return a token." };
  }

  let tokens: Awaited<ReturnType<typeof googleLogin>>;
  try {
    tokens = await googleLogin(token);
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(error, "We could not sign you in with Google."),
    };
  }

  const store = await cookies();
  setAuthCookies(store, tokens);

  setFlash(store, {
    type: "success",
    message: "Signed in with Google",
    description: "Welcome back to EduSphere.",
  });

  const role = decodeRoleFromAccessToken(tokens.accessToken);
  const target = safeNext(next);
  redirect(target ?? (role ? homePathForRole(role) : "/"));
}

export async function forgotPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  const parsed = forgotPasswordSchema.safeParse({
    email: readString(formData.get("email")),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Enter a valid email address.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    await forgotPassword(parsed.data);
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not send a reset code. Please try again.",
      ),
    };
  }

  const store = await cookies();
  store.set(PENDING_EMAIL_COOKIE, parsed.data.email, {
    ...authCookieOptions(PENDING_EMAIL_MAX_AGE),
  });
  setFlash(store, {
    type: "success",
    message: "Reset code sent",
    description: `We emailed a 6-digit code to ${parsed.data.email}.`,
  });
  redirect("/reset-password");
}

export async function resetPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<ActionResult<null>> {
  const parsed = resetPasswordSchema.safeParse({
    email: readString(formData.get("email")),
    otp: readString(formData.get("otp")),
    newPassword: readString(formData.get("newPassword")),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the details below and try again.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  try {
    await resetPassword(parsed.data);
  } catch (error) {
    return {
      ok: false,
      message: messageFrom(
        error,
        "We could not reset your password. Please try again.",
      ),
    };
  }

  const store = await cookies();
  store.delete(PENDING_EMAIL_COOKIE);
  setFlash(store, {
    type: "success",
    message: "Password updated",
    description: "Log in with your new password.",
  });
  redirect("/login");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  clearAuthCookies(store);
  setFlash(store, { type: "success", message: "Signed out" });
  redirect("/");
}
