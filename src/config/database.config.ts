import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as sql from 'mssql';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  private readonly logger = new Logger(DatabaseConfig.name);

  constructor(private configService: ConfigService) {}

  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    await this.createDatabaseIfNotExists();
    return {
      type: 'mssql',
      host: this.configService.get('DB_HOST', 'localhost'),
      port: Number(process.env.DB_PORT),
      username: this.configService.get('DB_USERNAME', 'sa'),
      password: this.configService.get('DB_PASSWORD', 'YourStrong@Passw0rd'),
      database: this.configService.get('DB_DATABASE', 'EcommerceDB'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    };
  }

  private async createDatabaseIfNotExists(): Promise<void> {
    const dbName = this.configService.get('DB_DATABASE', 'EcommerceDB');
    try {
      const connection = await sql.connect({
        server: this.configService.get('DB_HOST', 'localhost'),
        port: Number(process.env.DB_PORT),
        user: this.configService.get('DB_USERNAME', 'sa'),
        password: this.configService.get('DB_PASSWORD', 'YourStrong@Passw0rd'),
        database: 'master',
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      });

      const checkQuery = `
        IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${dbName}')
        BEGIN
          CREATE DATABASE [${dbName}];
        END
      `;

      await connection.request().query(checkQuery);
      await connection.close();

      this.logger.log(`Database '${dbName}' ready`);
    } catch (error) {
      this.logger.error('Database creation failed:', error);
      throw error;
    }
  }
}
