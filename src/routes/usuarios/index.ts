import { FastifyInstance } from "fastify";
import prisma from "../../lib/prisma";
import bcryptjs from "bcryptjs";

export async function usuriosRoutes(fastify: FastifyInstance) {
  //rota para criar conta
  fastify.post("/", async (request, reply) => {
    const { email, senha } = request.body as {
      email: string;
      senha: string;
    };

    try {
      const salt = await bcryptjs.genSaltSync(10);
      const hash = await bcryptjs.hashSync(senha, salt);

      const usuarioExistente = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (usuarioExistente) {
        return reply
          .status(400)
          .send({ message: "Erro, já existe um usuário com esse email" });
      }

      const usuario = await prisma.user.create({
        data: {
          email,
          senha: hash,
        },
      });

      return reply.status(201).send({ message: "Conta criada com sucesso!!!" });
    } catch (error) {
      return reply.status(500).send({ message: "Erro ao criar conta" });
    }
  });

  //rota para fazer login
  fastify.post("/login", async (request, reply) => {
    const { email, senha } = request.body as {
      email: string;
      senha: string;
    };

    try {
      const usuarioExiiste = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!usuarioExiiste) {
        return reply
          .status(400)
          .send({ message: "Erro, não existe um usuário com esse email" });
      }

      const senhaValida = await bcryptjs.compareSync(
        senha,
        usuarioExiiste.senha,
      );

      if (!senhaValida) {
        return reply.status(400).send({ message: "Erro, senha incorreta" });
      }

      const token = fastify.jwt.sign(
        { userId: usuarioExiiste.id },
        { expiresIn: "1h" },
      );

      return reply
        .status(200)
        .send({ message: "Login realizado com sucesso", token });
    } catch (error) {
      return reply.status(500).send({ message: "Erro ao fazer login" });
    }
  });

  //rota para obter dados do usuário autenticado
  fastify.get(
    "/me",
    { preValidation: [fastify.authenticate] },
    async (request, reply) => {
      const userId = (request.user as { userId: string }).userId;

      try {
        const usuario = await prisma.user.findUnique({
          where: {
            id: userId,
          },
        });

        if (!usuario) {
          return reply.status(404).send({ message: "Usuário não encontrado" });
        }

        return reply.status(200).send(usuario);
      } catch (error) {
        return reply
          .status(500)
          .send({ message: "Erro ao obter dados do usuário" });
      }
    },
  );
}
