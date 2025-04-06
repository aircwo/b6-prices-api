import { FastifyReply, FastifyRequest } from "fastify";
import { config } from "../config/index";

export async function apiKeyCheck(request: FastifyRequest, reply: FastifyReply) {
  const apiKey = request.headers['x-api-key'];
  
  if (!apiKey || apiKey !== config.apiKey) {
    reply.code(401).send({ error: 'Unauthorised' });
    return;
  }
}