import dotenv from "dotenv";

dotenv.config({ path: ".env" });
process.env.ASYNC_TRANSPORT ??= "inmemory";
