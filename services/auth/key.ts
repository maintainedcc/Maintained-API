
// Expects 32-byte CSV ("1,2,3,4...")
const keyString = Deno.env.get("HMAC_SECRET") ?? "";
const arr: number[] = keyString.split(",").map(x => parseInt(x));
const keyArr = new Uint8Array(arr);

export const key = await crypto.subtle.importKey(
    "raw", keyArr,
    { name: "HMAC", hash: "SHA-256" } as any,
    false, ["verify"]
  ) as CryptoKey;