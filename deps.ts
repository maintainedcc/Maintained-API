
export { config } from "./environment/environment.dev.ts";

export { exists } from "https://deno.land/std@0.69.0/fs/exists.ts";
export { getCookies } from 'https://deno.land/std@0.69.0/http/cookie.ts';
export { serve } from "https://deno.land/std@0.69.0/http/server.ts";

export { 
  MongoClient,
	//Collection,
	//Database
} from "https://deno.land/x/mongo@v0.23.1/mod.ts";