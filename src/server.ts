import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import * as dotenv from "dotenv";
dotenv.config();
import { usuriosRoutes } from "./routes/usuarios";
import { tarefasRoutes } from "./routes/tarefas";
import cors from "@fastify/cors";

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyJwt, {
  secret: process.env.SECRET,
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

fastify.listen({ port: Number(process.env.PORT) }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
