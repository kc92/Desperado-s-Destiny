process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.REDIS_PASSWORD = 'redispassword';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.LOG_LEVEL = 'error';
process.env.SMTP_HOST = 'smtp.example.com';
// SMTP_USER intentionally unset to trigger EmailService fallback (just logs instead of sending)
// process.env.SMTP_USER = 'testuser';
process.env.SMTP_PASS = 'testpass';
process.env.ACCOUNT_MAX_FAILED_ATTEMPTS = '5';
process.env.ACCOUNT_LOCKOUT_MINUTES = '15';
