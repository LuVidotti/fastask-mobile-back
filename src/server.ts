import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import { usuriosRoutes } from "./routes/usuarios";
import { tarefasRoutes } from "./routes/tarefas";
import cors from "@fastify/cors";

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyJwt, {
  secret: process.env.SECRET as string,
});

fastify.register(cors, {
  origin: "*",
});

//middleware para autenticacao
fastify.decorate("authenticate", async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    return reply.code(401).send({ message: "Erro, nao autorizado" });
  }
});

//registrar rotas
fastify.register(usuriosRoutes, { prefix: "/usuarios" });
fastify.register(tarefasRoutes, { prefix: "/tarefas" });

//rota de teste
fastify.get("/", function (request, reply) {
  reply.send({ hello: "world" });
});

//rota de health check
fastify.get("/health", function (request, reply) {
  reply.send({ status: "ok" });
});

fastify.listen(
  { port: Number(process.env.PORT), host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    console.log(`Server listening on ${address}`);
  },
);

// Graceful shutdown
const signals = ["SIGINT", "SIGTERM"];
signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`Received ${signal}, closing server gracefully...`);
    try {
      await fastify.close();
      console.log("Server closed successfully");
    } catch (err) {
      console.error("Error closing server:", err);
    } finally {
      process.exit(0);
    }
  });
});
