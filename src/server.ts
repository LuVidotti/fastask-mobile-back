import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import * as dotenv from "dotenv";

// Só carrega .env em desenvolvimento
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

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

fastify.listen(
  { port: Number(process.env.PORT) || 3333, host: "0.0.0.0" },
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
    await fastify.close();
    process.exit(0);
  });
});
