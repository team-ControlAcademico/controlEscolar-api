import "dotenv/config";
import { createServer } from "http";

import app from "./app";
import { env } from "./config/env";
import { initSocket } from "./config/socket";

const httpServer = createServer(app);
const io = initSocket(httpServer);

// Hacer io accesible desde los controllers via req.app.get("io")
app.set("io", io);

httpServer.listen(env.PORT, () => {
  console.log(`[Backend] Servidor corriendo en http://localhost:${env.PORT}`);
  console.log(`[Backend] Entorno: ${env.NODE_ENV}`);
  console.log(`[Backend] Socket.io habilitado`);
});
