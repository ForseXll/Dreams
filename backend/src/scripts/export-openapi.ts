import { createApp } from '../app';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function exportOpenApi() {
  const fastify = await createApp({ logger: false, enableSwaggerUi: false });

  await fastify.ready();

  const openApiSpec = fastify.swagger();

  const outputPath = resolve(__dirname, '../../openapi.json');
  writeFileSync(outputPath, JSON.stringify(openApiSpec, null, 2));

  console.log('OpenAPI spec exported to', outputPath);

  await fastify.close();
}

exportOpenApi();
