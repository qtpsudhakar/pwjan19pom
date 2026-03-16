# Employee API — Documentation

Base URL: `http://localhost:3000`

> **Storage note:** All data is held in memory. Everything resets when the server restarts.

---

## Table of Contents

1. [Authentication Overview](#1-authentication-overview)
2. [Auth 1 — JWT Bearer Token](#2-auth-1--jwt-bearer-token)
3. [Auth 2 — HTTP Basic Auth](#3-auth-2--http-basic-auth)
4. [Auth 3 — API Key](#4-auth-3--api-key)
5. [Auth 4 — OAuth 2.0 Client Credentials](#5-auth-4--oauth-20-client-credentials)
6. [Employee Endpoints](#6-employee-endpoints)
7. [Data Model](#7-data-model)
8. [Validation Rules](#8-validation-rules)
9. [Error Responses](#9-error-responses)
10. [Test Credentials](#10-test-credentials)

---

## 1. Authentication Overview

The API exposes the same employee CRUD operations under four route prefixes, each protected by a different authentication mechanism. This lets you practice each auth type independently.

| Route Prefix        | Auth Type                  | How to Authenticate                        |
|---------------------|----------------------------|--------------------------------------------|
| `/employees`        | JWT Bearer Token           | `POST /auth/login` → `Authorization: Bearer <token>` |
| `/basic/employees`  | HTTP Basic Auth            | `Authorization: Basic base64(user:pass)`   |
| `/apikey/employees` | API Key                    | `x-api-key: <key>` header                 |
| `/oauth/employees`  | OAuth 2.0 (Client Creds)   | `POST /oauth/token` → `Authorization: Bearer <token>` |

> **Token isolation:** OAuth tokens are rejected on `/employees`, and JWT login tokens are rejected on `/oauth/employees`. Each route only accepts tokens intended for it.

---

## 2. Auth 1 — JWT Bearer Token

### POST /auth/login

Exchange a username and password for a signed JWT. The token expires in **1 hour**.

**Request**

```
POST /auth/login
Content-Type: application/json
```

```json
{
  "username": "admin_user",
  "password": "admin_pass"
}
```

**Success Response — 200 OK**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**

| Status | Condition | Body |
|--------|-----------|------|
| `400` | Missing `username` or `password` | `{ "error": "username and password are required" }` |
| `401` | Wrong credentials | `{ "error": "Invalid credentials" }` |

**Using the token**

Include the token in every subsequent request to `/employees`:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Auth errors on protected routes**

| Status | Condition | Body |
|--------|-----------|------|
| `401` | No `Authorization` header, or not `Bearer` scheme | `{ "error": "Missing or invalid Authorization header" }` |
| `401` | Token expired or malformed | `{ "error": "Invalid or expired token" }` |
| `401` | OAuth token used on JWT route | `{ "error": "Invalid token type" }` |

---

## 3. Auth 2 — HTTP Basic Auth

No separate login step. Send your credentials with every request using the `Authorization: Basic` scheme.

**How to encode credentials**

```
base64("username:password")
```

Example — `admin_user:admin_pass` encodes to `YWRtaW5fdXNlcjphZG1pbl9wYXNz`.

**Request header**

```
Authorization: Basic YWRtaW5fdXNlcjphZG1pbl9wYXNz
```

**Auth errors on protected routes**

| Status | Condition | Body |
|--------|-----------|------|
| `401` | No `Authorization` header, or not `Basic` scheme | `{ "error": "Missing or invalid Authorization header" }` |
| `401` | Malformed base64 (no `:` separator) | `{ "error": "Invalid credentials format" }` |
| `401` | Wrong username or password | `{ "error": "Invalid credentials" }` |

---

## 4. Auth 3 — API Key

No login step. Send a pre-shared API key in a custom header with every request.

**Request header**

```
x-api-key: key-admin-xyz789
```

**Auth errors on protected routes**

| Status | Condition | Body |
|--------|-----------|------|
| `401` | `x-api-key` header missing or empty | `{ "error": "Missing or invalid API key" }` |
| `401` | Key not recognised | `{ "error": "Missing or invalid API key" }` |

**Available keys**

| Key | Identity |
|-----|----------|
| `key-standard-abc123` | Standard User |
| `key-admin-xyz789` | Admin User |

---

## 5. Auth 4 — OAuth 2.0 Client Credentials

### POST /oauth/token

Exchange a `client_id` + `client_secret` for a short-lived access token. Only the `client_credentials` grant type is supported. The token expires in **1 hour**.

**Request**

```
POST /oauth/token
Content-Type: application/json
```

```json
{
  "grant_type": "client_credentials",
  "client_id": "test-client",
  "client_secret": "test-secret"
}
```

**Success Response — 200 OK**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Error Responses**

| Status | Condition | Body |
|--------|-----------|------|
| `400` | `grant_type` is not `client_credentials` | `{ "error": "unsupported_grant_type" }` |
| `400` | Missing `client_id` or `client_secret` | `{ "error": "client_id and client_secret are required" }` |
| `401` | Wrong client credentials | `{ "error": "invalid_client" }` |
| `401` | Unknown `client_id` | `{ "error": "invalid_client" }` |

**Using the token**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Send this header on every request to `/oauth/employees`.

**Auth errors on protected routes**

| Status | Condition | Body |
|--------|-----------|------|
| `401` | No `Authorization` header, or not `Bearer` scheme | `{ "error": "Missing or invalid Authorization header" }` |
| `401` | Token expired or malformed | `{ "error": "Invalid or expired token" }` |
| `401` | JWT login token used on OAuth route | `{ "error": "Invalid token type" }` |

**Available clients**

| client_id | client_secret | Name |
|-----------|---------------|------|
| `test-client` | `test-secret` | Test Application |
| `admin-client` | `admin-secret` | Admin Application |

---

## 6. Employee Endpoints

All four route prefixes (`/employees`, `/basic/employees`, `/apikey/employees`, `/oauth/employees`) expose the same set of endpoints. Replace `{prefix}` with the appropriate prefix for the auth type you are using.

---

### GET /{prefix}

Return all employees. Optionally filter by department.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `department` | string | No | Filter to only employees in this department |

**Example**

```
GET /employees?department=Engineering
Authorization: Bearer <token>
```

**Success Response — 200 OK**

```json
[
  {
    "id": "emp-001",
    "firstName": "Alice",
    "lastName": "Smith",
    "email": "alice.smith@company.com",
    "department": "Engineering",
    "role": "Engineer",
    "createdAt": "2026-03-15T10:00:00.000Z"
  }
]
```

Returns an empty array `[]` if no employees exist (or none match the filter).

---

### GET /{prefix}/:id

Return a single employee by ID.

**Path Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | The employee ID, e.g. `emp-001` |

**Example**

```
GET /employees/emp-001
Authorization: Bearer <token>
```

**Success Response — 200 OK**

```json
{
  "id": "emp-001",
  "firstName": "Alice",
  "lastName": "Smith",
  "email": "alice.smith@company.com",
  "department": "Engineering",
  "role": "Engineer",
  "createdAt": "2026-03-15T10:00:00.000Z"
}
```

**Error Response**

| Status | Condition | Body |
|--------|-----------|------|
| `404` | ID not found | `{ "error": "Employee not found", "id": "emp-999" }` |

---

### POST /{prefix}

Create a new employee.

**Request**

```
POST /employees
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "firstName": "Alice",
  "lastName": "Smith",
  "email": "alice.smith@company.com",
  "department": "Engineering",
  "role": "Engineer"
}
```

**Success Response — 201 Created**

```json
{
  "id": "emp-001",
  "firstName": "Alice",
  "lastName": "Smith",
  "email": "alice.smith@company.com",
  "department": "Engineering",
  "role": "Engineer",
  "createdAt": "2026-03-15T10:00:00.000Z"
}
```

**Error Responses**

| Status | Condition | Body |
|--------|-----------|------|
| `400` | Any required field missing | `{ "error": "Validation failed", "details": ["firstName is required"] }` |
| `400` | Invalid department | `{ "error": "Validation failed", "details": ["department must be one of: Engineering, HR, Finance, Marketing"] }` |
| `400` | Duplicate email | `{ "error": "Validation failed", "details": ["email already exists"] }` |

---

### PUT /{prefix}/:id

Fully replace an existing employee. All fields must be provided. The `id` and `createdAt` fields are preserved from the original record.

**Request**

```
PUT /employees/emp-001
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "firstName": "Alice",
  "lastName": "Johnson",
  "email": "alice.johnson@company.com",
  "department": "HR",
  "role": "Manager"
}
```

**Success Response — 200 OK**

Returns the updated employee object (same shape as POST response).

**Error Responses**

| Status | Condition | Body |
|--------|-----------|------|
| `404` | ID not found | `{ "error": "Employee not found", "id": "emp-999" }` |
| `400` | Any required field missing | `{ "error": "Validation failed", "details": [...] }` |
| `400` | Invalid department | `{ "error": "Validation failed", "details": ["department must be one of: ..."] }` |

---

### PATCH /{prefix}/:id

Partially update an employee. Only the fields you provide are changed. All omitted fields are left unchanged. `id` and `createdAt` can never be changed.

**Request**

```
PATCH /employees/emp-001
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "role": "Senior Engineer"
}
```

**Success Response — 200 OK**

Returns the full updated employee object.

**Error Responses**

| Status | Condition | Body |
|--------|-----------|------|
| `404` | ID not found | `{ "error": "Employee not found", "id": "emp-999" }` |
| `400` | Invalid department value | `{ "error": "Validation failed", "details": ["department must be one of: ..."] }` |

---

### DELETE /{prefix}/:id

Remove an employee.

**Request**

```
DELETE /employees/emp-001
Authorization: Bearer <token>
```

**Success Response — 204 No Content**

Empty body.

**Error Response**

| Status | Condition | Body |
|--------|-----------|------|
| `404` | ID not found | `{ "error": "Employee not found", "id": "emp-999" }` |

---

## 7. Data Model

### Employee Object

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `id` | string | Server-generated | Format: `emp-001`, `emp-002`, … Sequential, never reused within a session |
| `firstName` | string | Request body | Required |
| `lastName` | string | Request body | Required |
| `email` | string | Request body | Required. Must be unique across all employees |
| `department` | string | Request body | Required. Must be one of the valid values |
| `role` | string | Request body | Required |
| `createdAt` | string (ISO 8601) | Server-generated | Set at creation time, never changes |

### Valid Departments

`Engineering` · `HR` · `Finance` · `Marketing`

---

## 8. Validation Rules

Applied by `POST` and `PUT` (full replacement requires all fields). `PATCH` only validates `department` if it is included in the request.

| Rule | Applies to |
|------|-----------|
| `firstName` is required | POST, PUT |
| `lastName` is required | POST, PUT |
| `email` is required | POST, PUT |
| `department` is required | POST, PUT |
| `role` is required | POST, PUT |
| `department` must be one of the valid values | POST, PUT, PATCH |
| `email` must be unique | POST only |

When validation fails, all errors are collected and returned together:

```json
{
  "error": "Validation failed",
  "details": [
    "firstName is required",
    "email is required"
  ]
}
```

---

## 9. Error Responses

### Standard Error Shape

```json
{
  "error": "Human-readable error message",
  "details": ["optional", "array", "of", "specifics"]
}
```

`details` is only present on validation errors (400).

### HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| `200` | Success (GET, PUT, PATCH, login) |
| `201` | Created (POST employee) |
| `204` | Deleted (no body) |
| `400` | Bad request — missing fields, invalid values, duplicate email, unsupported grant type |
| `401` | Unauthorised — missing/invalid/expired credentials or token |
| `404` | Not found — employee ID does not exist |

---

## 10. Test Credentials

### Users (JWT + Basic Auth)

| Username | Password | Display Name |
|----------|----------|--------------|
| `standard_user` | `secret_sauce` | Standard User |
| `admin_user` | `admin_pass` | Admin User |

### API Keys

| Key | Display Name |
|-----|--------------|
| `key-standard-abc123` | Standard User |
| `key-admin-xyz789` | Admin User |

### OAuth Clients

| client_id | client_secret | Name |
|-----------|---------------|------|
| `test-client` | `test-secret` | Test Application |
| `admin-client` | `admin-secret` | Admin Application |

---

## Quick Reference — Full Request Examples

### 1. JWT — Get all employees

```
POST /auth/login
Content-Type: application/json

{ "username": "admin_user", "password": "admin_pass" }

→ { "token": "<jwt>" }

GET /employees
Authorization: Bearer <jwt>
```

### 2. Basic Auth — Create an employee

```
POST /basic/employees
Authorization: Basic YWRtaW5fdXNlcjphZG1pbl9wYXNz
Content-Type: application/json

{
  "firstName": "Bob",
  "lastName": "Jones",
  "email": "bob.jones@company.com",
  "department": "HR",
  "role": "Recruiter"
}
```

### 3. API Key — Get a single employee

```
GET /apikey/employees/emp-001
x-api-key: key-admin-xyz789
```

### 4. OAuth 2.0 — Update an employee's role

```
POST /oauth/token
Content-Type: application/json

{ "grant_type": "client_credentials", "client_id": "admin-client", "client_secret": "admin-secret" }

→ { "access_token": "<token>", "token_type": "Bearer", "expires_in": 3600 }

PATCH /oauth/employees/emp-001
Authorization: Bearer <token>
Content-Type: application/json

{ "role": "Lead Engineer" }
```
