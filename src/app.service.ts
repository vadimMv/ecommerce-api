import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getDetailedHealth(): object {
    return {
      status: 'OK',
      service: 'E-commerce API',
      version: '1.0.0',
      database: 'SQL Server',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
