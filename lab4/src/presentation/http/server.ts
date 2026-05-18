import dotenv from "dotenv";
import { createApp } from "./app";
import { startIntegrationConsumers } from "../../composition/container";

dotenv.config({ path: ".env" });

async function bootstrap() {
  await startIntegrationConsumers();

  const app = createApp();
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
