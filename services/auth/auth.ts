
import { jwtVerify } from "../../deps.ts";
import { secret } from "./private.key.ts";

const key = await crypto.subtle.importKey(
	"raw", secret,
	{ name: "HMAC", hash: "SHA-256" } as any,
	false, ["verify"]
) as CryptoKey;

export class AuthService {

	async verify(jwt: string): Promise<string> {
		const res = await jwtVerify(
			jwt, key, { issuer: "maintained-id" });

		if (res.payload.sub) return res.payload.sub;
		else throw new Error("[AUTH] Invalid token");
	}

}