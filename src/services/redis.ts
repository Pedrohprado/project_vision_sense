import Redis from 'ioredis';

export const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
});

redis.on('connect', () => {
  console.log('✅ conectado ao Redis com suceso!');
});
redis.on('ready', () => {
  console.log('🚀 Redis pronto para uso');
});

redis.on('error', (err) => {
  console.error('❌ Erro na conexão com Redis:', err);
});
