# 4. Security Architecture

## 4.1. Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                          Edge Security                           │
│  • DDoS Protection  • WAF Rules  • SSL/TLS  • Bot Protection   │
└─────────────────────────────────────────────────────────────────┘
                                   │
┌─────────────────────────────────────────────────────────────────┐
│                      Application Security                        │
│  • JWT Authentication  • OAuth 2.0  • API Keys  • Rate Limiting │
└─────────────────────────────────────────────────────────────────┘
                                   │
┌─────────────────────────────────────────────────────────────────┐
│                         Service Security                         │
│  • mTLS  • Service Mesh  • Network Policies  • RBAC            │
└─────────────────────────────────────────────────────────────────┘
                                   │
┌─────────────────────────────────────────────────────────────────┐
│                          Data Security                           │
│  • Encryption at Rest  • Encryption in Transit  • Key Management│
└─────────────────────────────────────────────────────────────────┘
```

## 4.2. Authentication & Authorization Flow

```python
# Authentication Flow
class AuthenticationFlow:
    """
    1. User provides credentials (username/password, OAuth, SSO)
    2. Auth Service validates credentials
    3. Generate JWT with claims
    4. Return access_token and refresh_token
    5. Client includes token in Authorization header
    6. API Gateway validates token
    7. Service receives validated user context
    """

    async def authenticate(self, credentials: Credentials) -> TokenPair:
        # Validate credentials
        user = await self.validate_credentials(credentials)

        # Generate tokens
        access_token = self.generate_jwt(
            user_id=user.id,
            organization_id=user.organization_id,
            roles=user.roles,
            expires_in=timedelta(hours=1)
        )

        refresh_token = self.generate_refresh_token(
            user_id=user.id,
            expires_in=timedelta(days=30)
        )

        # Store refresh token
        await self.store_refresh_token(user.id, refresh_token)

        return TokenPair(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=3600
        )

# Authorization Flow
class AuthorizationFlow:
    """
    1. Extract user context from validated JWT
    2. Load user permissions from cache/database
    3. Check resource ownership
    4. Apply RBAC rules
    5. Apply attribute-based access control (ABAC)
    6. Log access decision
    """

    async def authorize(
        self,
        user_context: UserContext,
        resource: Resource,
        action: Action
    ) -> bool:
        # Check organization membership
        if not await self.check_organization(user_context, resource):
            return False

        # Check resource permissions
        permissions = await self.get_permissions(user_context, resource)

        # Apply RBAC
        if not self.check_rbac(user_context.roles, action):
            return False

        # Apply ABAC
        if not self.check_abac(user_context, resource, action):
            return False

        # Log decision
        await self.audit_log(user_context, resource, action, "granted")

        return True
```

## 4.3. Data Protection

```yaml
encryption:
  at_rest:
    databases:
      algorithm: AES-256-GCM
      key_management: AWS KMS / Azure Key Vault
      rotation: 90 days

    file_storage:
      algorithm: AES-256-GCM
      client_side: Optional for sensitive data
      server_side: Always enabled

  in_transit:
    external:
      protocol: TLS 1.3
      cipher_suites: [TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256]
      certificate: Let's Encrypt / ACM

    internal:
      service_mesh: mTLS via Istio/Linkerd
      database: TLS with certificate validation

data_masking:
  pii_detection:
    - Email addresses
    - Phone numbers
    - SSN/Tax IDs
    - Credit card numbers

  masking_rules:
    display: Partial masking (show last 4 digits)
    export: Full masking or removal
    ai_processing: Anonymization

compliance:
  gdpr:
    - Right to be forgotten
    - Data portability
    - Consent management
    - Privacy by design

  soc2:
    - Access controls
    - Audit logging
    - Incident response
    - Business continuity
```