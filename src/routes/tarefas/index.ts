import { FastifyInstance } from "fastify";
import prisma from "../../lib/prisma";

export async function tarefasRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const tarefas = await prisma.tarefa.findMany({
          where: {
            userId: request.user.userId,
          },
        });

        return reply.status(200).send(tarefas);
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao buscar tarefas" });
      }
    },
  );

  fastify.post(
    "/",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { titulo } = request.body as { titulo: string };
      const userId = request.user.userId;

      if (!titulo) {
        return reply.status(400).send({ message: "Titulo e obrigatorio" });
      }

      try {
        const tarefa = await prisma.tarefa.create({
          data: {
            titulo,
            userId,
          },
        });
        return reply
          .status(201)
          .send({ message: "Tarefa criada com sucesso!!!", tarefa });
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao criar tarefa" });
      }
    },
  );

  fastify.put(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { titulo } = request.body as { titulo: string };
      const userId = request.user.userId;

      if (!titulo) {
        return reply.status(400).send({ message: "Titulo e obrigatorio" });
      }

      try {
        const tarefaASerAtualizada = await prisma.tarefa.findFirst({
          where: {
            id,
            userId,
          },
        });

        if (!tarefaASerAtualizada) {
          return reply.status(404).send({ message: "Tarefa nao encontrada" });
        }

        const tarefaAtualizada = await prisma.tarefa.update({
          where: {
            id,
          },
          data: {
            titulo,
          },
        });

        return reply.status(200).send({
          message: "Tarefa atualizada com sucesso",
          tarefa: tarefaAtualizada,
        });
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao atualizar tarefa" });
      }
    },
  );

  fastify.delete(
    "/:id",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const userId = request.user.userId;

      try {
        const tarefaASerDeletada = await prisma.tarefa.findFirst({
          where: {
            id,
            userId,
          },
        });

        if (!tarefaASerDeletada) {
          return reply.status(404).send({ message: "Tarefa nao encontrada" });
        }

        await prisma.tarefa.delete({
          where: {
            id,
          },
        });

        return reply
          .status(200)
          .send({ message: "Tarefa deletada com sucesso" });
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao deletar tarefa" });
      }
    },
  );

  fastify.put(
    "/:id/completar",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const userId = request.user.userId;

      try {
        const tarefa = await prisma.tarefa.findFirst({
          where: {
            id,
            userId,
          },
        });

        if (!tarefa) {
          return reply.status(404).send({ message: "Tarefa nao encontrada" });
        }

        const tarefaAtualizada = await prisma.tarefa.update({
          where: {
            id,
          },
          data: {
            concluida: true,
          },
        });

        return reply.status(200).send({
          message: "Tarefa concluida com sucesso",
          tarefa: tarefaAtualizada,
        });
      } catch (error) {
        return reply.status(500).send({ message: "Erro ao completar tarefa" });
      }
    },
  );
}
