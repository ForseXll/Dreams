import { createApp } from './app';
import { logger } from './logger/logger-provider';

const PORT = parseInt(process.env.PORT || '4000');

async function start() {
  const fastify = await createApp({ logger: true, enableSwaggerUi: true });
  const appLogger = logger.provider.child('app');

  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    appLogger.info({ port: PORT }, 'Server started');
  } catch (err) {
    appLogger.error({ err }, 'Server failed to start');
    process.exit(1);
  }
}

start();
