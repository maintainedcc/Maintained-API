
import "https://deno.land/x/dotenv@v3.1.0/load.ts";

// Oak (Server)
export { Application, Router, send } from "https://deno.land/x/oak@v10.1.0/mod.ts";

// Service dependencies
export { exists } from "https://deno.land/std@0.99.0/fs/exists.ts";
export { crypto } from "https://deno.land/std@0.122.0/crypto/mod.ts";
export { jwtVerify } from "https://deno.land/x/jose@v4.3.8/jwt/verify.ts";

// Mongo (Database)
export { MongoClient, Collection, Database } from "https://deno.land/x/mongo@v0.29.0/mod.ts";