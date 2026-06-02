# Backend Agent Standards

These standards apply to the Spring Boot backend under `src/main/java/com/wajih/banking`. The backend owns authentication, financial operations, idempotency, persistence, notifications, AI service integration, and API behavior.

## Architecture Rules

- Keep controller, service, repository, entity, DTO, security, and exception responsibilities separate.
- Controllers such as `BankingController`, `AuthController`, `AIController`, and `NotificationController` should validate request shape, delegate to services, and return DTO responses.
- Services such as `BankingService`, `IdempotencyService`, `JwtService`, `AIService`, and `NotificationService` own business logic and transaction boundaries.
- Repositories under `repository/` must stay persistence-focused and should not contain API, security, or presentation logic.
- Entities under `entity/` represent persisted state; do not expose them directly as public API responses.
- DTOs under `dto/` define API input and output contracts.
- Cross-cutting error behavior belongs in `GlobalExceptionHandler`, not scattered controller branches.

## Spring Boot Rules

- Use constructor injection for required dependencies.
- Put transactional money operations in service methods with `@Transactional`.
- Keep validation annotations on DTOs and enforce them with `@Valid` at controller boundaries.
- Prefer explicit response DTOs over maps or raw entity serialization.
- Keep configuration in `application.properties`, environment variables, or runtime secret wiring; never hardcode environment-specific values in Java.
- Preserve compatibility with Java 17 and Spring Boot 3.5.x.

## JWT Handling Expectations

- JWT signing secrets must come from runtime configuration and must be consistent across Kubernetes replicas.
- Do not generate per-pod signing keys for deployed environments.
- `JwtAuthenticationFilter` should reject invalid, expired, malformed, or missing tokens without leaking token contents.
- `JwtService` should centralize token creation, parsing, validation, claims handling, and expiry logic.
- Do not log Authorization headers, JWTs, signing secrets, or decoded sensitive claims.
- Authentication failures must be explicit enough for debugging but safe for clients.

## BigDecimal Rules For Money

- Use `BigDecimal` for all persisted and computed monetary values.
- Never use `double`, `float`, or binary floating point for balances, transfers, deposits, withdrawals, payments, or fees.
- Create decimal values from strings or validated request payloads, not from floating point constructors.
- Normalize scale and rounding deliberately when needed; do not rely on implicit formatting.
- Compare money with `compareTo`, not `equals`, when numeric equality matters.
- Reject zero, negative, null, NaN-like, or malformed monetary input at DTO/service boundaries.

## Idempotency Handling

- Financial write operations must preserve idempotency protection.
- Do not remove or bypass `IdempotencyService`, `IdempotencyRecord`, or `IdempotencyRecordRepository` behavior.
- Repeated requests with the same valid idempotency key must return the original compatible result or a clear conflict.
- Different payloads under the same idempotency key must fail with an idempotency conflict.
- Store enough request fingerprint and response metadata to distinguish replay from conflict.
- Idempotency errors should use explicit exception handling such as `IdempotencyConflictException`.

## Validation Strategy

- Validate request DTOs with bean validation annotations.
- Enforce domain invariants inside services even when DTO validation exists.
- Validate authenticated user identity against the requested operation.
- Validate sufficient balance before withdrawal, transfer, or payment.
- Validate transfer target existence and prevent invalid self-transfer behavior unless explicitly supported.
- Validate AI request inputs before calling Ollama-backed flows.
- Return structured API responses rather than ambiguous strings.

## Exception Handling

- Keep user-facing errors stable, specific, and safe.
- Centralize common errors in `GlobalExceptionHandler`.
- Do not leak stack traces, SQL details, JWT internals, secrets, or full request payloads.
- Preserve HTTP semantics: authentication failures, authorization failures, validation failures, conflicts, and server errors should not collapse into `200 OK`.
- Log server-side diagnostics with correlation-friendly context, not sensitive values.

## Test Expectations

- Money operations need tests for success, insufficient funds, invalid amounts, and precision-sensitive values.
- Idempotency needs tests for replay, payload conflict, and missing/invalid keys where applicable.
- JWT/security changes need tests for authenticated and unauthenticated paths.
- Controller changes need request validation coverage.
- Repository or transaction changes need tests that exercise locking or consistency assumptions.
- For broad changes, run the full Maven lifecycle.

## Debugging Checklist

1. Run `git status --short` and identify changed backend files.
2. Reproduce with a targeted test or local request.
3. Inspect controller request mapping and DTO validation.
4. Inspect service transaction boundaries and user authorization checks.
5. Inspect repository queries, locks, and entity relationships.
6. Check `GlobalExceptionHandler` behavior for the thrown exception.
7. Check `SecurityConfig`, `JwtAuthenticationFilter`, and `JwtService` for auth failures.
8. Confirm runtime properties and secrets are available in the target environment.
9. Run backend validation commands.

## Backend Validation Commands

```bash
./mvnw test
./mvnw verify
./mvnw spring-boot:run
./mvnw org.owasp:dependency-check-maven:check
```

Useful local smoke checks after the app starts:

```bash
curl -i http://localhost:8080/actuator/health
curl -i http://localhost:8080/api/auth/login
```

Adjust paths only after confirming the actual controller mappings.

## Forbidden Backend Anti-Patterns

- Returning JPA entities directly from controllers.
- Placing business logic in controllers.
- Performing money calculations with `double` or `float`.
- Updating balances outside a transaction.
- Removing row locking or transaction protections from transfer flows without an equivalent safety mechanism.
- Bypassing idempotency because a request is "only a retry."
- Catching broad exceptions and returning success.
- Logging JWTs, passwords, secrets, or full financial payloads.
- Hardcoding database credentials, JWT secrets, CORS origins, or Ollama endpoints.
- Disabling security filters, validation, or tests to make a build pass.

