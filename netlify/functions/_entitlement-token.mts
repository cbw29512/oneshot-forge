const encoder = new TextEncoder();

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmac(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function issueEntitlementToken(productId: string, secret: string): Promise<string> {
  const payload = `${productId}.${Date.now()}`;
  const signature = await hmac(payload, secret);
  return `${payload}.${signature}`;
}

export async function verifyEntitlementToken(
  token: string | null,
  productId: string,
  secret: string,
): Promise<boolean> {
  if (!token) return false;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const [tokenProductId, issuedAt, signature] = parts;
    if (tokenProductId !== productId || !/^\d+$/.test(issuedAt)) return false;

    const payload = `${tokenProductId}.${issuedAt}`;
    const expected = await hmac(payload, secret);

    if (expected.length !== signature.length) return false;

    let mismatch = 0;
    for (let i = 0; i < expected.length; i += 1) {
      mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return mismatch === 0;
  } catch (error) {
    console.error("99centoneshots entitlement token verification failed", error);
    return false;
  }
}

export function entitlementCookieName(productId: string): string {
  return `oneshot_owned_${productId.replace(/[^a-z0-9_-]/gi, "_")}`;
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie") ?? "";
  for (const pair of header.split(";")) {
    const [rawName, ...rest] = pair.trim().split("=");
    if (rawName === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}
