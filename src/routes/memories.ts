import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
export async function memoriesRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (request) => {
    await request.jwtVerify();
  });

  app.get("/memories", async (request) => {
    const memories = await prisma.memory.findMany({
      where: {
        userId: request.user.sub,
      },
      orderBy: {
        createAt: "asc",
      },
    });

    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt: memory.content.substring(0, 115).concat("..."),
        createAt: memory.createAt,
      };
    });
  });

  app.get("/memories/:id", async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = paramsSchema.parse(request.params);

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    });

    if (!memory.isPublic && memory.userId !== request.user.sub) {
      return reply.status(401).send();
    }

    return memory;
  });

  app.post("/memories", async (request) => {
    const createMemorySchema = z.object({
      coverUrl: z.string().url(),
      content: z.string().min(1),
      isPublic: z.coerce.boolean().default(false),
    });

    const { coverUrl, content, isPublic } = createMemorySchema.parse(
      request.body
    );

    const memory = await prisma.memory.create({
      data: {
        coverUrl,
        content,
        isPublic,
        userId: request.user.sub,
      },
    });

    return memory;
  });

  app.put("/memories/:id", async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = paramsSchema.parse(request.params);

    const requestSchema = z.object({
      coverUrl: z.string().url().optional(),
      content: z.string().min(1).optional(),
      isPublic: z.coerce.boolean().default(false).optional(),
    });

    const { coverUrl, content, isPublic } = requestSchema.parse(request.body);

    let memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    });

    if (memory.userId !== request.user.sub) {
      return reply.status(401).send();
    }

    memory = await prisma.memory.update({
      where: {
        id,
      },
      data: { coverUrl, content, isPublic },
    });

    return memory;
  });

  app.delete("/memories/:id", async (request, reply) => {
    await request.jwtVerify();

    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = paramsSchema.parse(request.params);

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    });

    if (memory.userId !== request.user.sub) {
      return reply.status(401).send();
    }

    await prisma.memory.delete({
      where: {
        id,
      },
    });

    return true;
  });
}
