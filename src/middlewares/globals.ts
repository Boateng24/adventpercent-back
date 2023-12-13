import { RateLimitMiddleware } from './rate-limit.middleware';
import { HelmetMiddleware } from './helmet.middleware';

export const globalMiddlewares = [RateLimitMiddleware, HelmetMiddleware];
