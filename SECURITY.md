# Security Implementation

## Overview
The FHU Meal Tracker app implements multiple layers of security to protect user credentials and sensitive data.

## Security Features

### 1. **Encrypted Credential Storage (Expo SecureStore)**

#### What it does:
- Stores username and password separately using hardware-backed encryption
- On iOS: Uses Keychain Services
- On Android: Uses EncryptedSharedPreferences with AES-256 encryption
- On Web: Falls back to browser's secure storage APIs

#### Implementation:
```typescript
// Storing credentials securely
await SecureStore.setItemAsync(USERNAME_KEY, username);
await SecureStore.setItemAsync(CREDENTIALS_KEY, password);

// Retrieving credentials securely
const username = await SecureStore.getItemAsync(USERNAME_KEY);
const password = await SecureStore.getItemAsync(CREDENTIALS_KEY);
```

#### Benefits:
- ✅ Hardware-backed encryption on supported devices
- ✅ Data encrypted at rest
- ✅ Credentials separated (username and password stored separately)
- ✅ Automatic encryption/decryption
- ✅ Protected from unauthorized app access

### 2. **HTTPS Communication**

#### What it does:
- All API calls to FHU campus card center use HTTPS
- Credentials transmitted over encrypted TLS connections

#### Implementation:
```typescript
const baseURL = "https://fhu.campuscardcenter.com/ch/";
const response = await fetch(fullURL, {
  method: "POST",
  headers: {
    Accept: "*/*",
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: URLParametersString,
});
```

#### Benefits:
- ✅ Encrypted data in transit
- ✅ Protection against man-in-the-middle attacks
- ✅ Server authentication via SSL certificates

### 3. **Password Masking in UI**

#### What it does:
- Password field uses `secureTextEntry` prop
- Profile screen shows masked password (bullets)

#### Implementation:
```typescript
// Login screen
<TextInput
  secureTextEntry
  // ... other props
/>

// Profile screen
<Text>{'•'.repeat(8)}</Text>
```

#### Benefits:
- ✅ Prevents shoulder surfing
- ✅ Hides password length in profile
- ✅ No plaintext password display

### 4. **Memory Management**

#### What it does:
- Credentials cleared from memory on logout
- State reset on logout

#### Implementation:
```typescript
const logout = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(USERNAME_KEY);
  await SecureStore.deleteItemAsync(CREDENTIALS_KEY);

  setCredentials(null);
  setDiningDollars(null);
  // ... clear all state
};
```

#### Benefits:
- ✅ Credentials removed from device storage
- ✅ App state fully cleared
- ✅ No residual data in memory

### 5. **No Logging of Sensitive Data**

#### What it does:
- Console logs do not include passwords
- Only log non-sensitive data (meal counts, etc.)

#### Benefits:
- ✅ Passwords not in device logs
- ✅ Reduced exposure in debug builds

## Security Best Practices Implemented

### ✅ Principle of Least Privilege
- App only requests credentials when needed
- Credentials only accessed during authentication

### ✅ Defense in Depth
- Multiple security layers (encryption, HTTPS, UI masking)
- No single point of failure

### ✅ Secure by Default
- SecureStore used automatically
- HTTPS enforced for all network calls

### ✅ Fail Securely
- Authentication errors don't expose system details
- Generic error messages shown to users

## Additional Security Considerations

### For Production Deployment:

1. **Certificate Pinning** (Optional Enhancement)
   - Pin FHU server SSL certificate
   - Prevents MITM attacks with compromised CAs

2. **Biometric Authentication** (Optional Enhancement)
   - Add Face ID / Touch ID support
   - Reduces password re-entry

3. **Session Timeout** (Optional Enhancement)
   - Auto-logout after inactivity period
   - Re-authentication required

4. **Root/Jailbreak Detection** (Optional Enhancement)
   - Detect compromised devices
   - Warn users or restrict functionality

## What Data is Stored

| Data Type | Storage Method | Encrypted |
|-----------|---------------|-----------|
| Username | SecureStore | ✅ Yes |
| Password | SecureStore | ✅ Yes |
| Meal Data | In-memory state | N/A (not persisted) |
| Transactions | In-memory state | N/A (not persisted) |

## What Data is NOT Stored

- ❌ Session tokens (not used by FHU site)
- ❌ Historical meal data (re-fetched on each load)
- ❌ Cached HTML responses
- ❌ Browser cookies

## Security Audit Checklist

- [x] Credentials stored with encryption
- [x] HTTPS used for all network calls
- [x] Passwords masked in UI
- [x] Sensitive data cleared on logout
- [x] No plaintext passwords in logs
- [x] Secure storage APIs used (SecureStore)
- [x] Input validation on login fields
- [x] Error messages don't leak system info

## Reporting Security Issues

If you discover a security vulnerability, please email: ttenon@fhu.edu

**Do not** open public GitHub issues for security vulnerabilities.

## Compliance

This app handles authentication credentials for educational purposes. Students should:
- Use their official FHU credentials
- Not share their login with others
- Report any suspicious activity
- Log out on shared devices

## Updates and Maintenance

- Expo SecureStore: Updated with Expo SDK updates
- Dependencies: Regular security audits via `npm audit`
- FHU API: Changes monitored for security updates

---

**Last Updated:** December 8, 2025
**Security Review:** Initial Implementation
