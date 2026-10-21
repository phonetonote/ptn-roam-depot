import { SERVER_URL, SHARED_HEADERS } from "./constants";

// Onboarding proves the Roam user owns their email before the server hands out a ptn key:
// 1. requestCode emails an 8-character code to the address.
// 2. verifyCode exchanges that code for the account's ptn key (new or existing account).

export type OnboardingError = "invalid_email" | "invalid_code" | "rate_limited" | "network";

export type RequestCodeResult = { ok: true } | { ok: false; reason: OnboardingError };

export type VerifyCodeResult =
  | { ok: true; ptnKey: string; clerkId: string }
  | { ok: false; reason: OnboardingError };

type FetchFn = typeof fetch;

export const ERROR_MESSAGES: Record<OnboardingError, string> = {
  invalid_email: "we couldn't read a valid email from your roam account.",
  invalid_code: "that code didn't work or has expired. check your email or send a new one.",
  rate_limited: "too many tries. please wait a few minutes and try again.",
  network: "couldn't reach phonetonote. please try again.",
};

export const errorForStatus = (status: number): OnboardingError => {
  if (status === 400) return "invalid_email";
  if (status === 401) return "invalid_code";
  if (status === 429) return "rate_limited";
  return "network";
};

const post = (fetchFn: FetchFn, path: string, body: object) =>
  fetchFn(`${SERVER_URL}${path}`, {
    method: "POST",
    mode: "cors",
    headers: SHARED_HEADERS,
    body: JSON.stringify(body),
  });

export const requestCode = async (
  email: string,
  roamId: string,
  fetchFn: FetchFn = fetch
): Promise<RequestCodeResult> => {
  if (!email) return { ok: false, reason: "invalid_email" };

  try {
    const response = await post(fetchFn, "/clerk/create", { email, roam_id: roamId });
    return response.status === 202 ? { ok: true } : { ok: false, reason: errorForStatus(response.status) };
  } catch {
    return { ok: false, reason: "network" };
  }
};

export const verifyCode = async (
  email: string,
  code: string,
  roamId: string,
  fetchFn: FetchFn = fetch
): Promise<VerifyCodeResult> => {
  try {
    const response = await post(fetchFn, "/clerk/verify", { email, code, roam_id: roamId });
    if (response.status !== 201) return { ok: false, reason: errorForStatus(response.status) };

    const { ptnKey, clerkId } = await response.json();
    if (typeof ptnKey !== "string" || typeof clerkId !== "string") {
      return { ok: false, reason: "network" };
    }
    return { ok: true, ptnKey, clerkId };
  } catch {
    return { ok: false, reason: "network" };
  }
};
