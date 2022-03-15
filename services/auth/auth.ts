import { jwtVerify } from "../../deps.ts";
import { key } from "./key.ts";

export class AuthService {
  async verify(jwt: string): Promise<{ id: string; login: string }> {
    const res = await jwtVerify(jwt, key, { issuer: "maintained-id" });

    if (res.payload.aud && res.payload.sub) {
      return { id: res.payload.aud.toString(), login: res.payload.sub };
    } else throw new Error("[AUTH] Invalid token");
  }
}
