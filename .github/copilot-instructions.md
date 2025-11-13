# Casco API Test Suite - AI Coding Instructions

## Project Overview
This is a **Mocha-based API testing framework** for KASKO (car insurance) policy management microservices. It tests multiple API components (Authentication, Dictionary, ONES, ESBD, TWB, KASKO) with multi-environment support and schema validation.

## Architecture & Key Flows

### Test Execution Flow
1. **Config Generation** (`filesParser.js`): Reads `.env.test`, generates `JSONLoader.js` (singleton loader for all test resources), updates `configData.json` with CLI flags
2. **Hook Setup** (`baseTest.js` `mochaHooks.beforeAll`): Initializes DB connection, authenticates all 6 API clients, determines ESBD presence
3. **Test Run**: Specs execute with schema validation (chai-json-schema) and subset assertions (chai-subset)
4. **Report Generation**: Allure reports from mocha results via `generateAllureReport()`

### Multi-Environment Setup Pattern
- Base config: `test/resources/data/configData.json`
- Loaded via: `JSONLoader.configData` (auto-generated getter)
- Environment overrides: `.env.test` variables (e.g., `GATEWAY_URL`, `VERIFICATION`, `SET_POLICY_WAITING_TWB`)
- CLI overrides: `--parallel`, `--setPolicyWaitingTWB` flags parsed in `filesParser.js`
- Precedence: CLI flags > `.env.test` > defaults

### API Architecture
- **BaseAPI** (`baseAPI.js`): Wraps axios with logging; `get/post/patch` methods catch errors without throwing
- **Specialized APIs**: Each extends BaseAPI (authAPI, dictionaryAPI, onesAPI, ESBDAPI, KASKOAPI, TWBAPI)
- **Auth Pattern**: Each API calls `setToken()` in hook to fetch bearer token from `authAPI.auth()`
- **User Context**: `global.withESBD` flag set in beforeAll determines schema expectations

### Data Transformation Pipeline
- **JSONLoader**: Dynamically loaded from `test/resources/` (data/, mapping/, schemas/, templates/)
- **JSONMapper**: Flattens/unflattens nested objects; maps request→response via schema paths (e.g., `requestToGetPolicyMapSchema`)
- **DataUtils**: Applies domain logic (date reformatting, payment type handling, TWB bugs) post-mapping
- **Randomizer/TimeUtils**: Generate test values (random integers, business days, date conversions)

### Database Integration
- **BaseDB**: mysql2/promise wrapper for ONES database queries
- **onesDB**: Inherits BaseDB; methods like `getOnesContent(policyNumber)` retrieve test state
- Connected/closed in `mochaHooks` (beforeAll/afterAll)

## Critical Patterns & Conventions

### Response Assertion Pattern
```javascript
const response = await API.method();
response.status.should.be.equal(200);
response.data.should.containSubset(JSONLoader.templateResponse.methodName);
if (global.withESBD) {
  response.data.should.be.jsonSchema(JSONLoader.schemaName);
}
```
- Always check `.status` first
- Use `containSubset` for partial assertions (ignores extra fields)
- Conditionally validate against JSON schema only if ESBD is active

### Logging Convention
```javascript
Logger.log('[req] ▶ post {...params} to endpoint:');  // Request
Logger.log('[res]   status code: 200');                 // Response status
Logger.log('[inf] ▶ operation description');            // Info
```
Use prefixes: `[req]`, `[res]`, `[inf]`, `[err]` with Unicode arrows. Logs hidden if `configData.hiddenLogBodies=true`.

### Configuration Access
- Never hardcode values; use `JSONLoader.configData.field` or `process.env.VAR`
- All configs auto-loaded in `filesParser.js` before tests run
- New config fields must: (1) add to `configData.json`, (2) update `filesParser.js` parsing logic

## Testing Workflows

### Run Commands
- `npm run config && npm run mocha:run` — standard serial run
- `npm run test` — alias for above
- `npm run test:parallel` — parallel execution (sets `configData.parallel=true`)
- `npm run test:split` — conditionally run spec by SPEC_PATTERN env var
- `npm run lint` — ESLint check (runs config first)

### Debug & Setup
- `npm run config` — regenerate JSONLoader.js and update configData.json from `.env.test`
- `npm run ci:generate` — generate `.split-config.yml` for GitLab parallel job splitting
- `npm run mocha:run` — run with Allure reporter, 240s timeout, 3 retries, bail on first failure

### Key Test Artifacts
- Mocha results → `test/artifacts/allure-results/`
- Allure report → `test/artifacts/allure-report/`
- Test client data → `test/resources/data/testClients.json` (fetched from API in hook)
- Temporary request/response data → `test/artifacts/{requestData,getPolicyData}.json`

## Important Conventions

1. **Error Handling**: BaseAPI catches axios errors; tests receive response objects (status + data) even on failure — no try/catch needed
2. **Date Formatting**: Tests use `moment` with DMY format (configurable in testData.json) and business day calculations
3. **Schema Flexibility**: Tests map schema using keys from `mapping/*.json` (e.g., `dictOnes` for 1C field names)
4. **ESBD Branching**: Many tests branch on `global.withESBD` flag (set via dictionaryAPI in hook)
5. **Resource Isolation**: Test data immutable — JSONLoader returns deep copies (`JSON.parse(JSON.stringify(...))`)

## Common Editing Tasks

### Adding a New API Client
1. Create `test/tests/API/NewAPI.js` extending `BaseAPI`
2. Add `setToken()` method calling `authAPI.auth()`
3. Add endpoint methods that call the inherited `get`, `post`, `patch` methods from BaseAPI
4. Initialize in `baseTest.js` import and `mochaHooks.beforeAll`

### Adding Test Scenarios
1. Create `test/tests/specs/specN.js` using Mocha's `describe/it` syntax
2. Use response assertions from pattern above
3. Access config/data via `JSONLoader.field` (auto-synced from resources)
4. Store temp data in `test/artifacts/` or pass between test steps

### Modifying Test Data or Schemas
1. Edit JSON files in `test/resources/` (data/, mapping/, schemas/, templates/)
2. Run `npm run config` to regenerate JSONLoader.js getters
3. Access new fields via `JSONLoader.fileName` in tests

## Dependencies & Key Libraries
- **mocha**: Test runner (240s timeout default)
- **chai + plugins**: Assertions (chai-subset for partial, chai-json-schema for validation)
- **axios**: HTTP client (wrapped by BaseAPI)
- **mysql2/promise**: Database queries
- **moment**: Date utilities
- **allure-mocha**: Test reporting
- **dotenv**: Environment configuration
