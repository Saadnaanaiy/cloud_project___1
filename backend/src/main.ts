import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {
  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const app = await NestFactory.create(AppModule);

  // CORS — supports multiple origins (comma-separated in FRONTEND_URL)
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim());

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // ── Swagger / OpenAPI ────────────────────────────────────────────────────────
  const swaggerDescription =
    '## Employee Management Platform — REST API\n\n' +
    'Full API documentation for the **EmpManager** cloud-native platform.\n\n' +
    '### Authentication\n' +
    'All protected endpoints require a **Bearer JWT token**.\n' +
    '1. Call `POST /api/auth/login` with your credentials.\n' +
    '2. Copy the `access_token` from the response.\n' +
    '3. Click **Authorize 🔒** above and paste the token.\n\n' +
    '### Role Matrix\n' +
    '| Role | Employees | Attendance | Reports | Audit |\n' +
    '|------|-----------|------------|---------|-------|\n' +
    '| `admin` | Full CRUD | Full | ✅ | ✅ |\n' +
    '| `hr` | Full CRUD | Mark | ✅ | ❌ |\n' +
    '| `manager` | Read | Mark | ❌ | ❌ |\n' +
    '| `employee` | Read own | Read own | ❌ | ❌ |';

  const config = new DocumentBuilder()
    .setTitle('EmpManager API')
    .setDescription(swaggerDescription)
    .setVersion('2.0')
    .setContact(
      'EmpManager Team',
      'https://empmanager.duckdns.org',
      'support@empmanager.io',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3001', 'Local Development')
    .addServer('https://empmanager.duckdns.org', 'Production (GKE)')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste your JWT access_token here (no "Bearer " prefix needed)',
        name: 'Authorization',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Auth', 'Authentication — login, register, profile management')
    .addTag('Employees', 'Employee CRUD, stats, block/unblock')
    .addTag('Departments', 'Department management')
    .addTag('Attendance', 'Daily attendance tracking and statistics')
    .addTag('Reports', 'Export employee data as PDF or Excel')
    .addTag('Messages', 'REST layer for real-time chat (WebSocket via Socket.IO)')
    .addTag('Audit', 'Security and audit log access (Admin only)')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // NOTE: Swagger UI is served at /docs — NOT at /api (that would create /api/api conflict)
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'EmpManager — API Documentation',
    customCss: `
      .swagger-ui .topbar { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
      .swagger-ui .topbar-wrapper .link { pointer-events: none; }
      .swagger-ui .info .title { font-size: 2rem; font-weight: 700; }
      .swagger-ui .scheme-container { background: #f8fafc; padding: 16px; border-radius: 8px; }
    `,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Backend running at http://localhost:${port}`);
  console.log(`📚 Swagger UI    → http://localhost:${port}/docs`);
  console.log(`📄 OpenAPI JSON  → http://localhost:${port}/docs-json`);
}
bootstrap();
