import "server-only";
import { endpoints } from "@/lib/api/endpoints";
import { serverFetch, serverFetchData } from "@/lib/api/server-fetch";
import type { AuthTokens } from "@/types/api";
import type { StudentProfileSummary, User } from "@/types/entities";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "./schemas";

export interface VerifyEmailPayload {
  accessToken: string;
  refreshToken: string;
  user: User;
  studentProfile: StudentProfileSummary | null;
}

export async function register(
  input: RegisterInput,
): Promise<{ message: string }> {
  const envelope = await serverFetch<null>(endpoints.auth.register, {
    method: "POST",
    body: input,
  });
  return { message: envelope.message };
}

export async function verifyEmail(
  input: VerifyEmailInput,
): Promise<VerifyEmailPayload> {
  return serverFetchData<VerifyEmailPayload>(endpoints.auth.verifyEmail, {
    method: "POST",
    body: input,
  });
}

export async function login(input: LoginInput): Promise<AuthTokens> {
  return serverFetchData<AuthTokens>(endpoints.auth.login, {
    method: "POST",
    body: input,
  });
}

export async function googleLogin(idToken: string): Promise<AuthTokens> {
  return serverFetchData<AuthTokens>(endpoints.auth.googleLogin, {
    method: "POST",
    body: { idToken },
  });
}

export async function forgotPassword(
  input: ForgotPasswordInput,
): Promise<void> {
  await serverFetch<null>(endpoints.auth.forgotPassword, {
    method: "POST",
    body: input,
  });
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  await serverFetch<null>(endpoints.auth.resetPassword, {
    method: "POST",
    body: input,
  });
}
