
# 📘 zero-log — Product & Software Requirements Document

## 1. Product Overview

**zero-log** is a high-performance, TypeScript-first logging library built on top of [Pino](https://github.com/pinojs/pino) for JavaScript/TypeScript projects.
Its goals are:

* **High Performance**: Built on Pino's ultra-fast JSON logging engine.
* **PII Protection**: Advanced PII masking and redaction capabilities with configurable rules.
* **Structured**: JSON log entries by default, human-readable in dev.
* **Extensible**: pluggable processors (redaction, enrichment, correlation).
* **Error reporting**: seamless integration with **Sentry** and optional transports.
* **Context-aware**: child loggers with request/user/session correlation.
* **Performance-first**: leverages Pino's near-zero overhead and async batching.

---

## 2. Objectives & Goals

* Provide a **consistent API** across Node.js and Browser.
* Support **common transports**: console (pretty/JSON), Sentry, HTTP.
* Ensure **secure logging** with redaction of sensitive fields.
* Enable **observability** by aligning with OpenTelemetry trace/span correlation.
* Deliver **developer ergonomics**: simple API, first-class TS typings, minimal setup.

---

## 3. Non-Goals

* zero-log will **not** ship logs to external providers directly (beyond generic HTTP & Sentry).
* It will **not** implement a full tracing system; only correlation hooks.
* It will **not** bundle heavy dependencies; transports requiring SDKs (e.g., Sentry) remain optional peer deps.

---

## 4. Core Use Cases

1. **Backend service logs**: JSON logs consumed by log shippers (e.g., Loki, Datadog).
2. **Frontend error reporting**: capture breadcrumbs & exceptions into Sentry.
3. **CLI tools**: pretty logs with colors for developers.
4. **Microservices**: propagate context (requestId, traceId).
5. **Security**: prevent accidental PII leaks via redaction.

---

## 5. Functional Requirements

### 5.1 Logger API

* `createLogger(options: LoggerOptions): Logger`
* Log methods:

  * `trace(msg, attrs?)`
  * `debug(msg, attrs?)`
  * `info(msg, attrs?)`
  * `warn(msg, attrs?)`
  * `error(msg, attrs?|Error)`
  * `fatal(msg, attrs?|Error)`
* Utility methods:

  * `child(ctx): Logger`
  * `with(ctx, fn)` → scoped context
  * `time(label).end(attrs?)` → timers
  * `count(name, delta?, attrs?)` → counters
  * `capture(error, attrs?)` → error serialization
  * `flush(): Promise<void>` → flush transports

---

### 5.2 Configuration Options (`LoggerOptions`)

* **name**: string — service/component identifier.
* **level**: enum `trace|debug|info|warn|error|fatal`.
* **mode**: enum `production|development|test`.
* **context**: default fields attached to every log.
* **processors**: array of functions mutating/validating entries.
* **transports**: array of sinks for log output.

---

### 5.3 Log Entry Schema

```json
{
  "ts": "2025-09-17T11:12:13.456Z",
  "level": "info",
  "msg": "payment.success",
  "name": "payments-service",
  "ctx": {
    "env": "production",
    "region": "us-east-1",
    "traceId": "abcd1234",
    "spanId": "efgh5678"
  },
  "attrs": {
    "orderId": "ord_789",
    "amount": 4999,
    "currency": "INR",
    "duration_ms": 42
  }
}
```

---

### 5.4 Processors

* **piiMask** — advanced PII masking using custom regex and path-based patterns with India-specific patterns.
* **redact** — mask/remove sensitive keys (`password`, `token`, `cardNumber`) with custom patterns.
* **enrich** — add static/dynamic metadata (serviceVersion, region).
* **otel** — attach OpenTelemetry trace/span IDs if available.
* **rateLimit** — prevent log flooding (token bucket).
* **sample** — probabilistic log/event sampling.

### 5.4.1 PII Masking Configuration

```typescript
interface PIIMaskingConfig {
  // Field paths to mask (supports nested paths like 'user.password')
  sensitivePaths: string[];
  // Custom mask value (default: '[REDACTED]')
  maskValue?: string;
  // Enable partial masking (e.g., '1234****' for credit cards)
  partialMasking?: boolean;
  // Custom patterns for regex-based masking
  customPatterns?: Array<{
    pattern: RegExp;
    replacement: string;
  }>;
}
```

---

### 5.5 Transports

* **consoleTransport**: pretty-print in dev, JSON in prod.
* **sentryTransport**:

  * map `error/fatal` → events
  * map `info/warn/error` → breadcrumbs
  * configurable sample rates
* **httpTransport**: batch POST JSON logs to an endpoint.
* **fileTransport (Node only)**: append JSONL with rotation hooks.

---

### 5.6 Error Handling

* Errors must be serialized safely:

  ```json
  {
    "name": "Error",
    "message": "failed to connect",
    "stack": "...",
    "cause": "TimeoutError"
  }
  ```
* Ensure processors run **before** transport (guaranteed redaction).

---

### 5.7 Performance

* Target <250ns overhead per `info` log (Node.js).
* Core bundle <5KB gzipped (browser).
* Async batching: flush logs every **16ms or 32 entries**.

---

## 6. System Requirements

### 6.1 Environment

* Node.js ≥ 18
* Browser: evergreen (Chrome, Firefox, Safari, Edge).
* Bundlers: Vite, Webpack, ESBuild (tree-shakeable ESM).

### 6.2 Dependencies

* **Core Dependencies**:
  * `pino` — High-performance JSON logger
* **Built-in PII Masking**: Custom regex and path-based masking (no external dependencies)
* **Optional peer deps** for transports (e.g., `@sentry/node`, `@sentry/browser`).

---

## 7. Architecture

### 7.1 Layers

1. **Pino Core** — High-performance JSON logging engine.
2. **zero-log Wrapper** — Enhanced API, PII masking, context management.
3. **Processors** — transform/enrich entries (PII masking, enrichment, correlation).
4. **Transports** — output destinations (console, Sentry, HTTP, file).
5. **Integrations** — middleware helpers (Express/Koa, fetch/XHR wrapper).

### 7.2 Flow

```
logger.info("msg", {attrs})
 → Pino serialization
 → processors (piiMask, redact, enrich, otel)
 → Pino transports (console, sentry, http)
```

---

## 8. Security & Compliance

* **Advanced PII Protection**: Comprehensive masking using custom regex and path-based patterns with India-specific patterns (Aadhaar, PAN, IFSC, UPI, etc.).
* **Redact secrets before transport**: Ensure sensitive data is masked before any output.
* **Truncate large payloads**: Limit payload size (>1KB) to prevent log flooding.
* **GDPR compliance**: Configurable PII dropping and masking rules.
* **Custom masking patterns**: Support for regex-based custom masking rules.
* **Audit trail**: Track what data was masked for compliance reporting.

---

## 9. Testing Plan

* **Unit tests**: processors, transports, logger API.
* **Integration tests**: Express middleware, Browser fetch wrapper.
* **Performance benchmarks**: measure throughput/overhead.
* **E2E tests**: verify Sentry transport against test DSN.

---

## 10. Packaging & Distribution

* Published as `zero-log` on npm.
* Build targets:

  * ESM (modern)
  * CJS (legacy Node)
  * TypeScript `.d.ts`
* Versioning: SemVer (start at `v0.1.0`).
* License: MIT (default).

---

## 11. Roadmap

* **v0.1**: Pino-based core, PII masking, console + sentry transports, basic processors.
* **v0.2**: Advanced PII masking rules, http transport, rate limiting, file transport.
* **v0.3**: browser fetch/XHR integration, React error boundary helper, custom masking patterns.
* **v1.0**: docs site, stable API, production-ready benchmarks, compliance reporting.

---

✅ This spec is detailed enough to serve as your **SRS/PRD + roadmap**.

Do you want me to also create the **repo skeleton (folder structure + starter TS code)** for zero-log so you can immediately open in VS Code and start coding?
