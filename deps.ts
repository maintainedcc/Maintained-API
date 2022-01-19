
import "https://deno.land/x/dotenv@v3.1.0/load.ts";

// Oak (Server)
export { Application, Router, send } from "https://deno.land/x/oak@v7.6.2/mod.ts";

// Service dependencies
export { exists } from "https://deno.land/std@0.99.0/fs/exists.ts";
export { crypto } from "https://deno.land/std@0.108.0/crypto/mod.ts";
export { jwtVerify } from "https://deno.land/x/jose@v3.18.0/jwt/verify.ts";

// Mongo (Database)
export { MongoClient, Collection, Database } from "https://deno.land/x/mongo@v0.27.0/mod.ts";