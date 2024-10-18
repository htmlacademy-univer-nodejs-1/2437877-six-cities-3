import 'reflect-metadata';
import { TYPES } from './infrastructure/types.js';
import {Application} from './Application.js';
import {container} from './infrastructure/container.js';

async function bootstrap() {
  const application = container.get<Application>(TYPES.Application);
  await application.Init();
}

bootstrap();
