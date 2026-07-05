import "./bootstrap/telemetry.bootstrap";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { setupOpenApi } from "./bootstrap/openapi.bootstrap";
import { env } from "./config/env.schema";
import { ProblemFilter } from "./shared/http/problem.filter";
import { StructuredLogger } from "./shared/observability/logging";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: false,
    logger: ["error", "warn", "log"],
  });
  app.useLogger(new StructuredLogger());
  app.getHttpAdapter().getInstance().set("trust proxy", 1);
  app.use(cookieParser());
  app.useGlobalFilters(new ProblemFilter());
  setupOpenApi(app);
  app.enableShutdownHooks();
  await app.listen(env.PORT, "0.0.0.0");
}
bootstrap().catch((err) => {
  console.error("Fatal startup error", err);
  process.exitCode = 1;
});
