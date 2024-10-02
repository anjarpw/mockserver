import { Request, Response, Router } from 'express';
import { EndpointManager } from '../endpointManager';
import { EndpointRegistrationRequest, HttpMethod, MockResponseConfig } from '../contracts';
require('dotenv').config()

// IN MEMORY
import { InMemoryRegisteredEndpointRepo } from '../inMemRepo/inMemRegisteredEndpointRepo';
import { InMemoryEndpointEventListRepo, InMemoryEndpointEventRepo } from '../inMemRepo/inMemEndpointEventRepo';

function generateInMemoryEndpointManager(): EndpointManager {
  const endpointRegistrationRepo = new InMemoryRegisteredEndpointRepo()
  const endpointEventRepo = new InMemoryEndpointEventRepo(new InMemoryEndpointEventListRepo())
  return new EndpointManager(endpointRegistrationRepo, endpointEventRepo)
}

// REDIS
import { RedisRegisteredEndpointRepo } from '../redisRepo/redisRegisteredEndpointRepo';
import { RedisMethodAndPathRepo } from '../redisRepo/redisMethodAndPathRepo';
import { RedisEndpointEventRepo } from '../redisRepo/redisEndpointEventRepo';
import Redis from "ioredis"

function generateRedisEndpointManager(): EndpointManager {
  const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    password: process.env.REDIS_PASSWORD, // Redis password from .env, optional
  })
  const methodAndPathRepo = new RedisMethodAndPathRepo(redis)
  const endpointRegistrationRepo = new RedisRegisteredEndpointRepo(redis, methodAndPathRepo)
  const endpointEventRepo = new RedisEndpointEventRepo(redis, methodAndPathRepo)
  return new EndpointManager(endpointRegistrationRepo, endpointEventRepo)
}


const adminRouter = Router();


const endpointManager = generateRedisEndpointManager()
// Define the controller endpoints
adminRouter.post('/register/:id', async (req: Request, res: Response) => {
  const request: EndpointRegistrationRequest = req.body;
  const { id } = req.params;
  try {
    const registeredEndpoint = await endpointManager.register(id, request);
    res.status(201).json(registeredEndpoint);
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

adminRouter.post('/reset/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const endpoint = await endpointManager.reset(id);
    if (endpoint) {
      res.status(200).json(endpoint);
    } else {
      res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

adminRouter.delete('/remove/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const removedEndpoint = await endpointManager.remove(id);
    if (removedEndpoint) {
      res.status(200).json(removedEndpoint);
    } else {
      res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error });
  }
});



adminRouter.get('/get/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const endpoint = await endpointManager.get(id);
    if (endpoint) {
      res.status(200).json(endpoint);
    } else {
      res.status(404).json({ error: 'Endpoint not found' });

    }
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

adminRouter.get('/map', async (_req: Request, res: Response) => {
  try {
    const endpointMap = await endpointManager.map();
    res.status(200).json(endpointMap);
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

adminRouter.post('/clear', async (_req: Request, res: Response) => {
  try {
    const cleared = await endpointManager.clear();
    res.status(200).json({ cleared });
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

const mockRouter = Router();
mockRouter.use(async (req, res, next) => {
  try {
    const mockResponse: MockResponseConfig = await endpointManager.tryHandlingRequest({
      headers: req.headers,
      url: req.url,
      method: req.method as HttpMethod,
      query: req.query,
      body: req.body,
      path: req.path,
      params: req.params
    })
    res.status(mockResponse.code).json(mockResponse.body)
  } catch {
    next();
  }
})

export {
  adminRouter,
  mockRouter
}