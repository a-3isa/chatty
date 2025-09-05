# Security Documentation

This document outlines the security features and best practices implemented in the Chatty application.

## 🔐 Authentication & Authorization

### JWT Token-Based Authentication

- **Access Tokens**: Short-lived (15 minutes) JWT tokens for API access
- **Refresh Tokens**: Long-lived (7 days) tokens for seamless token renewal
- **Secure Storage**: Tokens are stored in memory/client-side storage (not localStorage for security)
- **Automatic Renewal**: Access tokens are automatically renewed using refresh tokens

### Password Security

- **Hashing**: Passwords are hashed using bcrypt with salt rounds
- **Strength Validation**: Minimum 8 characters, must contain uppercase, lowercase, numbers, and special characters
- **No Plain Text Storage**: Passwords are never stored in plain text

## 🛡️ Security Features

### Account Lockout Mechanism

- **Failed Attempt Tracking**: Tracks consecutive failed login attempts per user
- **Automatic Lockout**: Account locked after 5 consecutive failed attempts
- **Lockout Duration**: 15-minute lockout period to prevent brute force attacks
- **Manual Unlock**: Administrative endpoint to unlock accounts
- **Reset on Success**: Failed attempt counter resets on successful login

### Input Sanitization

- **Global Middleware**: All incoming requests are sanitized to prevent XSS and injection attacks
- **DOMPurify Integration**: Uses DOMPurify to clean HTML content
- **Recursive Sanitization**: Sanitizes nested objects and arrays in request bodies
- **Query Parameters**: GET parameters are also sanitized

### CSRF Protection

- **Custom CSRF Guard**: JWT-based CSRF protection for HTML clients
- **Token Validation**: CSRF tokens are validated on state-changing requests
- **Secure Headers**: CSRF protection works alongside security headers

### Security Headers (Helmet)

- **Content Security Policy (CSP)**: Prevents XSS attacks
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Strict-Transport-Security**: Enforces HTTPS connections
- **Referrer-Policy**: Controls referrer information leakage

### CORS Configuration

- **Production Restrictions**: CORS origins restricted to allowed domains
- **Development Flexibility**: More permissive in development environment
- **Credentials Support**: Secure cookie/credential handling
- **Method Restrictions**: Only necessary HTTP methods allowed

### Rate Limiting

- **Global Throttling**: 10 requests per minute per IP address
- **Configurable Limits**: TTL and limit values can be adjusted per environment
- **Automatic Blocking**: Excessive requests are automatically blocked

## 🔑 Password Reset Flow

### Secure Password Reset Process

1. **Request Reset**: User provides username to initiate reset
2. **Token Generation**: Secure JWT token generated with short expiry (15 minutes)
3. **Token Storage**: Reset token stored in database with expiry timestamp
4. **URL Generation**: Secure reset URL generated with embedded token
5. **Email Notification**: Reset link sent to user's email (currently logged to console)
6. **Token Validation**: Reset token validated before allowing password change
7. **Password Update**: New password hashed and stored securely
8. **Token Cleanup**: Reset token removed after successful password change

### Password Reset Endpoints

```http
POST /auth/forgot-password
Content-Type: application/json

{
  "username": "johndoe"
}
```

```http
POST /auth/reset-password?token=<reset_token>
Content-Type: application/json

{
  "password": "NewSecurePassword123!"
}
```

## 🚨 Security Monitoring & Logging

### Security Events Logged

- Failed login attempts
- Account lockouts
- Password reset requests
- Suspicious activities

### Error Handling

- **Generic Error Messages**: Prevents information leakage through error messages
- **Rate Limiting**: Protects against brute force attacks
- **Input Validation**: Comprehensive validation prevents malformed data

## 🔧 Security Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/chatty_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"

# Application
PORT=3000
NODE_ENV=production

# CORS (Production)
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

### Production Checklist

- [ ] Set strong JWT_SECRET (32+ characters, random)
- [ ] Configure ALLOWED_ORIGINS for production domains
- [ ] Enable HTTPS/TLS certificates
- [ ] Set NODE_ENV=production
- [ ] Configure proper database credentials
- [ ] Enable security headers
- [ ] Set up monitoring and alerting
- [ ] Regular security audits and dependency updates

## 📋 Security Best Practices

### Development

- Never commit secrets to version control
- Use environment variables for sensitive configuration
- Implement comprehensive input validation
- Follow principle of least privilege
- Regular security code reviews

### Deployment

- Use HTTPS in production
- Implement proper firewall rules
- Regular security updates and patches
- Monitor for security vulnerabilities
- Implement backup and recovery procedures

### User Education

- Encourage strong password policies
- Educate about phishing attempts
- Promote two-factor authentication (future enhancement)
- Regular security awareness training

## 🔮 Future Security Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Email integration for password reset
- [ ] Advanced threat detection
- [ ] Audit logging system
- [ ] Security event monitoring dashboard
- [ ] Automated security testing (SAST/DAST)
- [ ] API versioning for backward compatibility
- [ ] Rate limiting per user account
- [ ] Session management improvements

## 📞 Security Incident Response

### Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

1. **Do not** create public GitHub issues for security vulnerabilities
2. Email security concerns to: [security@yourdomain.com]
3. Include detailed information about the vulnerability
4. Allow reasonable time for response and fix

### Incident Response Process

1. **Detection**: Monitor security events and logs
2. **Assessment**: Evaluate impact and severity
3. **Containment**: Isolate affected systems
4. **Recovery**: Restore systems and data
5. **Lessons Learned**: Document and improve processes

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security)
- [JWT Security Best Practices](https://tools.ietf.org/html/rfc8725)
- [CORS Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
