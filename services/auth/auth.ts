
import { jwtVerify } from "../../deps.ts";
import { key } from "./key.ts";

export class AuthService {

	async verify(jwt: string): Promise<string> {
		const res = await jwtVerify(
			jwt, key, { issuer: "maintained-id" });

		if (res.payload.sub) return res.payload.sub;
		else throw new Error("[AUTH] Invalid token");
	}

}