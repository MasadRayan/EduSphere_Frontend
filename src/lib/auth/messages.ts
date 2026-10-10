import { AUTH_ERROR_COPY, type AuthFailureKind } from "@/lib/api/errors";

const AUTH_FAILURE_KIND_BY_MESSAGE: Record<string, keyof typeof AUTH_ERROR_COPY> =
  {
    "your account is blocked. please contact the administration.": "blocked",
    "you are not logged in. please log in to access this resource.":
      "unauthenticated",
    "forbidden. you don't have permission to access this resource.": "forbidden",
    "user is deleted. please contact support.": "deleted",
    "user credentials mismatch. please log in again.": "credentials",
  };

const AUTH_MESSAGE_MAP: Record<string, string> = {
  "user is blocked": AUTH_ERROR_COPY.blocked,
  "user is deleted": AUTH_ERROR_COPY.deleted,
  "user not verified": "This email is not verified yet. Verify it to continue.",
  "user already has account registered with google. try to login with google.":
    "This email is registered with Google. Continue with Google instead.",
  "user has account with google":
    "This email is registered with Google. Continue with Google instead.",
  "user not found": "We could not find an account with that email.",
  "user does not exist!": "We could not find an account with that email.",
  "user not found!": "We could not find an account with that email.",
  "invalid credentials": "Incorrect email or password. Please try again.",
  "invalid otp": "That code is not correct. Check the code and try again.",
  "otp does not match":
    "That code is not correct. Check the code and try again.",
  "email already verified":
    "This email is already verified. Please log in instead.",
  "registration data not found":
    "We could not find a pending registration. Please register again.",
  "user with this email already exists":
    "An account with this email already exists. Log in instead.",
  "current password is incorrect": "Your current password is incorrect.",
  "your account has no password set. please use the forgot password flow instead.":
    "This account signs in with Google, so it has no password to change.",
  "invalid or expired google id token":
    "Google sign-in expired. Please try again.",
  "google email not found": "Google did not share an email address.",
  "google email user name not found": "Google did not share your name.",
  "email not verified": "Your Google email is not verified.",
};

/**
 * Turns a raw backend auth message into user-facing copy. Unknown messages fall
 * back to the caller-provided default so we never leak internal wording.
 */
export function friendlyAuthMessage(
  raw: string | undefined,
  fallback: string,
): string {
  if (!raw) {
    return fallback;
  }
  return AUTH_MESSAGE_MAP[raw.trim().toLowerCase()] ?? fallback;
}
