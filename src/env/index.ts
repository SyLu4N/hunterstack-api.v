import 'dotenv/config';
import { z } from 'zod';

const envShcema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.coerce.number().default(3333),

  SECRET_KEY_GEMINIAI: z.string({
    invalid_type_error: 'Chave Secreta do GeminiAI inválida.',
  }),

  PATH_CHROME: z.string({ invalid_type_error: 'Caminho do Chrome inválido.' }),

  DATABASE_URL: z.string({
    invalid_type_error: 'Caminho do banco de dados inválido.',
  }),

  SHADOW_DATABASE_URL: z.string({
    invalid_type_error: 'Caminho do banco de dados shadow inválido.',
  }),
});

const _env = envShcema.safeParse(process.env);

if (_env.success === false) {
  console.error('❌ Variaveis ambientes inválidas', _env.error.format());

  throw new Error('Variaveis ambientes inválidas');
}

export const env = _env.data;
