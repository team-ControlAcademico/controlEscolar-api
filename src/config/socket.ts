import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyAccessToken } from "../utils/jwt";
import { env } from "./env";

let io: Server;

/**
 * Inicializa Socket.io sobre el servidor HTTP compartido con Express.
 * La autenticación se realiza en el middleware de conexión usando JWT.
 * Cada usuario se une a:
 *  - `user:<userId>` (mensajes directos)
 *  - `role:<role>` (avisos broadcast por rol)
 */
export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
  });

  // Middleware de autenticación
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) {
      return next(new Error("Token de acceso requerido"));
    }
    try {
      const decoded = verifyAccessToken(token);
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error("Token inválido o expirado"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user;
    if (!user) return;

    // Unirse a rooms personales
    socket.join(`user:${user.userId}`);
    socket.join(`role:${user.role}`);

    console.log(`[Socket.io] ${user.email} (${user.role}) conectado`);

    socket.on("disconnect", () => {
      console.log(`[Socket.io] ${user.email} desconectado`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.io no inicializado");
  return io;
}
