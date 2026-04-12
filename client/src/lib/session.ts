const ACCESS = "xes_access_token";
const LAST_EMAIL = "xes_last_login_email";
const PENDING_SIGNUP_EMAIL = "xes_pending_signup_email";
const EMAIL_VERIFY_TOKEN = "xes_email_verification_token";
const PASSWORD_RESET_TOKEN = "xes_password_reset_token";
const OTP_SESSION = "xes_otp_session_id";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS);
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS, token);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS);
}

export function setLastLoginEmail(email: string) {
  localStorage.setItem(LAST_EMAIL, email);
}

export function getLastLoginEmail(): string | null {
  return localStorage.getItem(LAST_EMAIL);
}

export function setPendingSignupEmail(email: string) {
  localStorage.setItem(PENDING_SIGNUP_EMAIL, email);
}

export function getPendingSignupEmail(): string | null {
  return localStorage.getItem(PENDING_SIGNUP_EMAIL);
}

export function setEmailVerificationToken(token: string) {
  localStorage.setItem(EMAIL_VERIFY_TOKEN, token);
}

export function getEmailVerificationToken(): string | null {
  return localStorage.getItem(EMAIL_VERIFY_TOKEN);
}

export function clearEmailVerificationToken() {
  localStorage.removeItem(EMAIL_VERIFY_TOKEN);
}

export function setPasswordResetToken(token: string) {
  localStorage.setItem(PASSWORD_RESET_TOKEN, token);
}

export function getPasswordResetToken(): string | null {
  return localStorage.getItem(PASSWORD_RESET_TOKEN);
}

export function clearPasswordResetToken() {
  localStorage.removeItem(PASSWORD_RESET_TOKEN);
}

export function setOtpSessionId(id: string) {
  localStorage.setItem(OTP_SESSION, id);
}

export function getOtpSessionId(): string | null {
  return localStorage.getItem(OTP_SESSION);
}

export function clearOtpSessionId() {
  localStorage.removeItem(OTP_SESSION);
}
