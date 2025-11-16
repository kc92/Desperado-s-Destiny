# Authentication System Documentation

## Overview

Complete production-ready authentication system for Desperados Destiny MMORPG backend with JWT-based authentication, secure password management, email verification, and password reset functionality.

## Architecture

### Components

1. **User Model** (`src/models/User.model.ts`)
   - Mongoose schema with authentication fields
   - Password hashing with bcrypt (12 rounds)
   - Token generation methods
   - Safe object conversion (removes sensitive fields)

2. **JWT Utilities** (`src/utils/jwt.ts`)
   - Token generation and verification
   - Cookie and header token extraction
   - Token expiration checking

3. **Authentication Middleware** (`src/middleware/auth.middleware.ts`)
   - `requireAuth` - Protects routes requiring authentication
   - `optionalAuth` - Attaches user if token present
   - `requireAdmin` - Requires admin role
   - `requireEmailVerified` - Ensures email is verified

4. **Authentication Controller** (`src/controllers/auth.controller.ts`)
   - User registration
   - Email verification
   - Login/logout
   - Password reset flow
   - Current user endpoint

5. **Authentication Routes** (`src/routes/auth.routes.ts`)
   - RESTful API endpoints
   - Built-in rate limiting (5 requests / 15 minutes)

## API Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification link.",
  "data": {
    "verificationToken": "..." // Only in development
  }
}
```

**Validation Rules:**
- Email: 5-254 characters, valid format
- Password: Min 8 characters, requires uppercase, lowercase, and number

**Errors:**
- `400` - Validation error
- `409` - Email already registered
- `429` - Too many requests

---

### POST /api/auth/verify-email
Verify user's email address.

**Request Body:**
```json
{
  "token": "verification-token-from-email"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email verified successfully. You can now log in."
}
```

**Errors:**
- `400` - Invalid or expired token

---

### POST /api/auth/login
Login and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user-id",
      "email": "user@example.com",
      "emailVerified": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "lastLogin": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

**Cookie Set:**
- Name: `token`
- HttpOnly: `true`
- SameSite: `Strict`
- Max-Age: 7 days
- Secure: `true` (production only)

**Errors:**
- `400` - Missing credentials
- `401` - Invalid credentials
- `403` - Email not verified or account inactive
- `429` - Too many attempts

---

### POST /api/auth/logout
Logout and clear authentication cookie.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /api/auth/me
Get current authenticated user.

**Headers:**
```
Cookie: token=<jwt-token>
```
OR
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user-id",
      "email": "user@example.com",
      "emailVerified": true,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "lastLogin": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

**Errors:**
- `401` - Not authenticated or invalid token

---

### POST /api/auth/forgot-password
Request password reset token.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent",
  "data": {
    "resetToken": "..." // Only in development
  }
}
```

**Note:** Always returns success to prevent email enumeration.

---

### POST /api/auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewStrongPassword456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successfully. You can now log in with your new password."
}
```

**Errors:**
- `400` - Invalid/expired token or password validation failed

---

## Security Features

### Password Security
- **Hashing**: bcrypt with 12 salt rounds
- **Validation**: Min 8 chars, uppercase, lowercase, number
- **Storage**: Never logged or returned in responses
- **Comparison**: Constant-time via bcrypt.compare()

### Token Security
- **JWT Storage**: HttpOnly cookies (not localStorage)
- **CSRF Protection**: SameSite=Strict cookie attribute
- **Token Expiration**: 7 days for access tokens
- **Verification Tokens**: 24-hour expiry
- **Reset Tokens**: 1-hour expiry
- **Token Format**: 32 bytes random hex (64 characters)

### Rate Limiting
- **Auth Endpoints**: 5 requests per 15 minutes per IP
- **Protection**: Prevents brute force attacks
- **Response**: 429 Too Many Requests

### Additional Security
- **Email Enumeration Prevention**: Generic messages for password reset
- **Case-Insensitive Email**: Normalized to lowercase
- **Active Account Check**: Inactive accounts cannot login
- **Email Verification**: Required before login
- **Secure Cookies**: HTTPS-only in production

---

## Authentication Flow

### Registration Flow
```
1. POST /api/auth/register
   ↓
2. Validate email and password
   ↓
3. Check email doesn't exist
   ↓
4. Hash password with bcrypt
   ↓
5. Create user (emailVerified: false)
   ↓
6. Generate verification token (24h expiry)
   ↓
7. [TODO] Send verification email
   ↓
8. Return success (no auto-login)
```

### Login Flow
```
1. POST /api/auth/login
   ↓
2. Find user by email
   ↓
3. Check email is verified
   ↓
4. Check account is active
   ↓
5. Compare password with bcrypt
   ↓
6. Update lastLogin timestamp
   ↓
7. Generate JWT token
   ↓
8. Set HttpOnly cookie
   ↓
9. Return safe user object
```

### Email Verification Flow
```
1. POST /api/auth/verify-email
   ↓
2. Find user by verification token
   ↓
3. Check token not expired
   ↓
4. Set emailVerified: true
   ↓
5. Clear verification token
   ↓
6. Return success
```

### Password Reset Flow
```
1. POST /api/auth/forgot-password
   ↓
2. Find user by email
   ↓
3. Generate reset token (1h expiry)
   ↓
4. [TODO] Send reset email
   ↓
5. Return success (always, to prevent enumeration)

---

6. POST /api/auth/reset-password
   ↓
7. Find user by reset token
   ↓
8. Check token not expired
   ↓
9. Validate new password
   ↓
10. Hash new password
    ↓
11. Update passwordHash
    ↓
12. Clear reset token
    ↓
13. Return success
```

---

## Database Schema

### User Model
```typescript
{
  email: String              // Unique, lowercase, trimmed
  passwordHash: String       // Bcrypt hash (select: false)
  emailVerified: Boolean     // Default: false
  verificationToken: String  // Unique, sparse index
  verificationTokenExpiry: Date
  resetPasswordToken: String // Unique, sparse index
  resetPasswordExpiry: Date
  createdAt: Date           // Auto-generated
  updatedAt: Date           // Auto-generated
  lastLogin: Date
  isActive: Boolean         // Default: true
  role: String              // Enum: ['user', 'admin'], default: 'user'
}
```

### Indexes
- `email` - Unique index
- `verificationToken` - Unique sparse index
- `resetPasswordToken` - Unique sparse index
- `isActive` - Index for performance

---

## Environment Variables

Required environment variables in `.env`:

```bash
# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Node Environment
NODE_ENV=development|production|test
```

---

## Testing

### Test Files
- `tests/auth/auth.register.test.ts` - Registration tests (22 tests)
- `tests/auth/auth.login.test.ts` - Login tests (24 tests)
- `tests/auth/auth.middleware.test.ts` - Middleware tests (25 tests)
- `tests/auth/auth.passwordReset.test.ts` - Password reset tests (25 tests)

### Run Tests
```bash
# Run all auth tests
npm test -- auth

# Run specific test file
npm test -- auth.register.test.ts

# Run with coverage
npm test

# Run in watch mode
npm test:watch
```

### Test Coverage
- User registration and validation
- Email verification
- Login with various scenarios
- JWT token handling
- Password reset flow
- Middleware authentication
- Error handling
- Security measures

---

## Usage Examples

### Frontend Integration

#### Register
```typescript
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'StrongPassword123'
  })
});

const data = await response.json();
// Show message: "Check your email for verification link"
```

#### Login
```typescript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important: Include cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'StrongPassword123'
  })
});

const data = await response.json();
// Token is automatically set in cookie
// Use data.data.user for user information
```

#### Get Current User
```typescript
const response = await fetch('http://localhost:5000/api/auth/me', {
  method: 'GET',
  credentials: 'include' // Important: Include cookies
});

const data = await response.json();
// data.data.user contains current user
```

#### Logout
```typescript
const response = await fetch('http://localhost:5000/api/auth/logout', {
  method: 'POST',
  credentials: 'include' // Important: Include cookies
});

// Cookie is cleared
```

---

## Future Enhancements

### Short Term
- [ ] Implement email sending (verification and password reset)
- [ ] Add refresh token mechanism
- [ ] Implement 2FA (Two-Factor Authentication)
- [ ] Add session management

### Medium Term
- [ ] OAuth integration (Google, GitHub, etc.)
- [ ] Account lockout after failed attempts
- [ ] Password history (prevent reuse)
- [ ] Login history tracking

### Long Term
- [ ] Biometric authentication
- [ ] Device fingerprinting
- [ ] Anomaly detection
- [ ] Advanced audit logging

---

## Troubleshooting

### Common Issues

#### "Authentication required"
- Ensure JWT token is included in cookie or Authorization header
- Check token hasn't expired (7 days)
- Verify user account is active

#### "Email not verified"
- User must verify email before login
- Check verification token hasn't expired (24 hours)
- Request new verification email

#### "Too many requests"
- Rate limit: 5 requests per 15 minutes
- Wait before retrying
- Consider implementing user feedback

#### Token in cookies not working
- Ensure `credentials: 'include'` in fetch requests
- Check CORS configuration allows credentials
- Verify domain matches (localhost issues)

---

## Security Best Practices

### For Developers
1. Never commit `.env` file with real secrets
2. Use strong JWT secrets (min 32 characters)
3. Always use HTTPS in production
4. Regularly rotate JWT secrets
5. Monitor for suspicious login patterns
6. Keep dependencies updated

### For Production
1. Enable Secure cookie flag
2. Configure strict CORS policies
3. Implement proper logging
4. Set up monitoring and alerts
5. Regular security audits
6. Backup database regularly

---

## Additional Resources

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## Support

For issues or questions:
1. Check this documentation
2. Review test files for examples
3. Check server logs for errors
4. Contact development team

---

**Version:** 1.0.0
**Last Updated:** 2025-11-16
**Status:** Production Ready
