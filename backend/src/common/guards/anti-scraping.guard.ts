import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

const BLOCKED_USER_AGENTS = [
  /python-requests/i,
  /aiohttp/i,
  /scrapy/i,
  /go-http-client/i,
  /^curl\//i,
  /^wget\//i,
  /httpclient/i,
  /playwright-python/i,
  /urllib/i,
  /postmanruntime/i,
];

@Injectable()
export class AntiScrapingGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const userAgent = req.headers['user-agent'] || '';

    // Bypass health check or swagger docs
    const path = req.path || '';
    if (path === '/' || path.startsWith('/api/docs') || path.startsWith('/health')) {
      return true;
    }

    // Check blocked bot User-Agents
    for (const pattern of BLOCKED_USER_AGENTS) {
      if (pattern.test(userAgent)) {
        throw new ForbiddenException(
          'Automated scraping is prohibited. Please use the official web or mobile application.',
        );
      }
    }

    // Require User-Agent on API requests
    if (!userAgent.trim()) {
      throw new ForbiddenException('Missing required client identification header.');
    }

    return true;
  }
}
