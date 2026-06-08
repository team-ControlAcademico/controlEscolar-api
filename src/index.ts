import "dotenv/config";

import app from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  console.log(`[Backend] Servidor corriendo en http://localhost:${env.PORT}`);
  console.log(`[Backend] Entorno: ${env.NODE_ENV}`);
});
