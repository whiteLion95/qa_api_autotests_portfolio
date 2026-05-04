# Casco API Autotests

## Overview
This repository contains automated API tests for the Casco insurance system's backend APIs. As a QA Engineer, I developed these tests to ensure API reliability, validate response schemas, and perform database validations. The project focuses on comprehensive test coverage for policy management, vehicle creation, tariff settings, and more.

## Disclaimer
This project is provided as read-only for demonstration purposes only. It showcases my skills in writing automated API tests, including test structure, assertions, and reporting. All sensitive data, credentials, and real endpoints have been removed or anonymized since this is based on a real work project. The code demonstrates best practices in QA automation without compromising security.

## Technologies Used
- **Node.js**: Runtime environment
- **Mocha**: Testing framework
- **Chai**: Assertion library with JSON schema validation
- **Axios**: HTTP client for API requests
- **Allure**: Test reporting and visualization
- **Sequelize & MySQL2**: Database testing and ORM
- **ESLint**: Code linting

## Project Structure
- `tests/API/`: API test modules (auth, casco, dictionary, etc.)
- `tests/DB/`: Database tests and models
- `tests/specs/`: Individual test specifications
- `tests/suites/`: Test suites for execution
- `resources/`: Test data, fixtures, schemas, and templates
- `test/artifacts/`: Allure reports and results

## Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables (copy `.env.test.example` to `.env.test` and fill in values)
4. Run configuration: `npm run config`

## Running Tests
- Full test suite: `npm test`
- Parallel execution: `npm run test:parallel`
- Split execution: `npm run test:split`
- Debug mode: `npm run test:debug`

## Reporting
Test results are generated using Allure. After running tests, view reports in `test/artifacts/allure-report`.

## Author
QA Engineer specializing in API automation and quality assurance.