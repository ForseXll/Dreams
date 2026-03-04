import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

type Json = Record<string, any>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');
const OPENAPI_PATH = resolve(ROOT_DIR, 'backend/openapi.json');
const POSTMAN_API_BASE_URL = 'https://api.getpostman.com';

const REQUIRED_ENV_VARS = ['POSTMAN_API_KEY'] as const;
const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']);

function requireEnv(name: (typeof REQUIRED_ENV_VARS)[number]): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function requireCollectionUid(): string {
  const value = process.env.POSTMAN_COLLECTION_UID || process.env.POSTMAN_WORKSPACE_COLLECTION;
  if (!value) {
    throw new Error(
      'Missing collection identifier. Set POSTMAN_COLLECTION_UID (preferred) or POSTMAN_WORKSPACE_COLLECTION.',
    );
  }
  return value;
}

function parseOptionalAuthOverride(): Json | null {
  const authType = process.env.POSTMAN_AUTH_TYPE?.trim().toLowerCase();
  if (!authType) {
    return null;
  }

  if (authType === 'none' || authType === 'noauth') {
    return { type: 'noauth', noauth: [] };
  }

  if (authType === 'bearer') {
    return {
      type: 'bearer',
      bearer: [
        {
          key: 'token',
          value: process.env.POSTMAN_AUTH_TOKEN || '{{authToken}}',
          type: 'string',
        },
      ],
    };
  }

  if (authType === 'apikey') {
    return {
      type: 'apikey',
      apikey: [
        {
          key: 'key',
          value: process.env.POSTMAN_AUTH_APIKEY_KEY || 'X-API-Key',
          type: 'string',
        },
        {
          key: 'value',
          value: process.env.POSTMAN_AUTH_APIKEY_VALUE || '{{apiKey}}',
          type: 'string',
        },
        {
          key: 'in',
          value: process.env.POSTMAN_AUTH_APIKEY_IN || 'header',
          type: 'string',
        },
      ],
    };
  }

  throw new Error(
    `Unsupported POSTMAN_AUTH_TYPE: ${process.env.POSTMAN_AUTH_TYPE}. Supported: none, bearer, apikey`,
  );
}

function runOpenApiExport() {
  const res = spawnSync('pnpm', ['--filter', 'backend', 'openapi:export'], {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    env: process.env,
  });

  if (res.status !== 0) {
    throw new Error('Failed to export OpenAPI spec via `pnpm --filter backend openapi:export`.');
  }
}

function readOpenApiSpec(): Json {
  if (!existsSync(OPENAPI_PATH)) {
    throw new Error(`OpenAPI file not found at ${OPENAPI_PATH}`);
  }

  return JSON.parse(readFileSync(OPENAPI_PATH, 'utf-8'));
}

async function postmanRequest<T>(
  method: 'GET' | 'PUT',
  path: string,
  apiKey: string,
  body?: Json,
): Promise<T> {
  const response = await fetch(`${POSTMAN_API_BASE_URL}${path}`, {
    method,
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const rawText = await response.text();
  let parsedBody: any = null;
  try {
    parsedBody = rawText ? JSON.parse(rawText) : null;
  } catch {
    parsedBody = { raw: rawText };
  }

  if (!response.ok) {
    throw new Error(
      `Postman API request failed (${method} ${path}): ${response.status} ${response.statusText}\n${JSON.stringify(parsedBody, null, 2)}`,
    );
  }

  return parsedBody as T;
}

function toPostmanPath(openApiPath: string): string {
  return openApiPath.replace(/\{([^}]+)\}/g, ':$1');
}

function normalizePath(path: string): string {
  const noQuery = path.split('?')[0] || '/';
  const cleaned = noQuery.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  return cleaned.replace(/:([A-Za-z0-9_\-]+)/g, '{$1}');
}

function requestKey(method: string, path: string): string {
  return `${method.toUpperCase()} ${normalizePath(path)}`;
}

function extractPathFromRequestUrl(url: any): string {
  if (typeof url === 'string') {
    return extractPathFromRawUrl(url);
  }

  if (url && typeof url === 'object') {
    if (typeof url.raw === 'string') {
      return extractPathFromRawUrl(url.raw);
    }

    if (Array.isArray(url.path)) {
      return `/${url.path.join('/')}`;
    }
  }

  return '/';
}

function extractPathFromRawUrl(raw: string): string {
  let value = raw.trim();

  value = value.replace(/^\{\{[^}]+\}\}/, '');

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      return parsed.pathname || '/';
    } catch {
      return '/';
    }
  }

  if (!value.startsWith('/')) {
    value = `/${value}`;
  }

  return value || '/';
}

function collectExistingRequests(
  items: any[],
  outMap: Map<string, Json>,
) {
  for (const item of items || []) {
    if (!item) continue;

    if (item.request) {
      const method = item.request?.method || 'GET';
      const path = extractPathFromRequestUrl(item.request?.url);
      outMap.set(requestKey(method, path), item);
    }

    if (Array.isArray(item.item)) {
      collectExistingRequests(item.item, outMap);
    }
  }
}

function parseOpenApiAuth(openapi: Json): Json | null {
  const globalSecurity = Array.isArray(openapi.security) ? openapi.security : [];
  const schemes = openapi.components?.securitySchemes || {};

  if (globalSecurity.length === 0) return null;

  const firstSecurity = globalSecurity[0] || {};
  const schemeName = Object.keys(firstSecurity)[0];
  if (!schemeName) return null;

  const scheme = schemes[schemeName];
  if (!scheme) return null;

  if (scheme.type === 'http' && scheme.scheme === 'bearer') {
    return {
      type: 'bearer',
      bearer: [{ key: 'token', value: '{{authToken}}', type: 'string' }],
    };
  }

  if (scheme.type === 'apiKey') {
    return {
      type: 'apikey',
      apikey: [
        { key: 'key', value: scheme.name || 'X-API-Key', type: 'string' },
        { key: 'value', value: '{{apiKey}}', type: 'string' },
        { key: 'in', value: scheme.in || 'header', type: 'string' },
      ],
    };
  }

  return null;
}

function buildBodyFromRequestBody(requestBody: Json | undefined): Json | undefined {
  if (!requestBody?.content || typeof requestBody.content !== 'object') {
    return undefined;
  }

  const content = requestBody.content['application/json'];
  if (!content) {
    return undefined;
  }

  let payload: any = {};

  if (content.example !== undefined) {
    payload = content.example;
  } else if (content.examples && typeof content.examples === 'object') {
    const firstExample = Object.values(content.examples)[0] as any;
    if (firstExample?.value !== undefined) {
      payload = firstExample.value;
    }
  }

  return {
    mode: 'raw',
    raw: JSON.stringify(payload, null, 2),
    options: {
      raw: {
        language: 'json',
      },
    },
  };
}

function createGeneratedCollection(openapi: Json): Json {
  const firstServerUrl = openapi.servers?.[0]?.url;
  const baseUrl = process.env.POSTMAN_BASE_URL || firstServerUrl || 'http://localhost:4000';
  const authOverride = parseOptionalAuthOverride();
  const openApiAuth = parseOpenApiAuth(openapi);

  const collection: Json = {
    info: {
      name: openapi.info?.title || 'API',
      description: openapi.info?.description || '',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    auth: authOverride || openApiAuth || undefined,
    variable: [
      {
        key: 'baseUrl',
        value: baseUrl,
      },
    ],
    item: [] as any[],
  };

  const byTag = new Map<string, any[]>();

  for (const [path, pathItem] of Object.entries(openapi.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem as Json)) {
      if (!HTTP_METHODS.has(method.toLowerCase())) {
        continue;
      }

      const upperMethod = method.toUpperCase();
      const op = operation as Json;
      const summary = op.summary || `${upperMethod} ${path}`;
      const tag = op.tags?.[0] || 'General';

      const request: Json = {
        method: upperMethod,
        header: [
          { key: 'Accept', value: 'application/json', type: 'text' },
        ],
        url: `{{baseUrl}}${toPostmanPath(path)}`,
        description: op.description || '',
      };

      const body = buildBodyFromRequestBody(op.requestBody);
      if (body) {
        request.body = body;
        request.header.push({ key: 'Content-Type', value: 'application/json', type: 'text' });
      }

      const generatedItem: Json = {
        name: summary,
        request,
        response: [],
      };

      const bucket = byTag.get(tag) || [];
      bucket.push(generatedItem);
      byTag.set(tag, bucket);
    }
  }

  for (const [tag, items] of byTag.entries()) {
    collection.item.push({
      name: tag,
      item: items,
    });
  }

  if (!collection.auth) {
    delete collection.auth;
  }

  return collection;
}

function mapVariables(variables: any[]): Map<string, Json> {
  const map = new Map<string, Json>();
  for (const variable of variables || []) {
    if (variable && variable.key) {
      map.set(String(variable.key), { ...variable });
    }
  }
  return map;
}

function getEnvVariableOverrides(): Json[] {
  const overrides: Json[] = [];

  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith('POSTMAN_VAR_')) continue;
    const varKey = key.slice('POSTMAN_VAR_'.length);
    if (!varKey) continue;

    overrides.push({ key: varKey, value: value ?? '' });
  }

  if (process.env.POSTMAN_BASE_URL) {
    overrides.push({ key: 'baseUrl', value: process.env.POSTMAN_BASE_URL });
  }

  if (process.env.POSTMAN_AUTH_TOKEN) {
    overrides.push({ key: 'authToken', value: process.env.POSTMAN_AUTH_TOKEN });
  }

  if (process.env.POSTMAN_AUTH_APIKEY_VALUE) {
    overrides.push({ key: 'apiKey', value: process.env.POSTMAN_AUTH_APIKEY_VALUE });
  }

  return overrides;
}

function mergeCollections(generatedCollection: Json, existingCollection: Json): { merged: Json; stats: Json } {
  const existingRequestMap = new Map<string, Json>();
  collectExistingRequests(existingCollection.item || [], existingRequestMap);

  const authOverride = parseOptionalAuthOverride();
  const keepAuth = !authOverride;

  let matchedRequests = 0;

  function mergeItems(items: any[]) {
    for (const item of items || []) {
      if (item.request) {
        const method = item.request.method || 'GET';
        const path = extractPathFromRequestUrl(item.request.url);
        const key = requestKey(method, path);
        const existing = existingRequestMap.get(key);

        if (existing) {
          matchedRequests += 1;

          if (Array.isArray(existing.event) && existing.event.length > 0) {
            item.event = existing.event;
          }

          if (Array.isArray(existing.response) && existing.response.length > 0) {
            item.response = existing.response;
          }

          if (keepAuth && existing.request?.auth) {
            item.request.auth = existing.request.auth;
          }
        }
      }

      if (Array.isArray(item.item)) {
        mergeItems(item.item);
      }
    }
  }

  mergeItems(generatedCollection.item || []);

  const generatedVars = mapVariables(generatedCollection.variable || []);
  const existingVars = mapVariables(existingCollection.variable || []);
  const envOverrides = mapVariables(getEnvVariableOverrides());

  const mergedVars = new Map<string, Json>();
  for (const [key, value] of generatedVars.entries()) mergedVars.set(key, value);
  for (const [key, value] of existingVars.entries()) mergedVars.set(key, value);
  for (const [key, value] of envOverrides.entries()) mergedVars.set(key, value);

  const mergedCollection: Json = {
    ...generatedCollection,
    info: {
      ...generatedCollection.info,
      _postman_id: existingCollection.info?._postman_id,
    },
    variable: [...mergedVars.values()],
    auth: authOverride || existingCollection.auth || generatedCollection.auth,
  };

  if (!mergedCollection.auth) {
    delete mergedCollection.auth;
  }

  return {
    merged: mergedCollection,
    stats: {
      generatedRequestCount: countRequests(generatedCollection.item || []),
      existingRequestCount: countRequests(existingCollection.item || []),
      matchedRequestCount: matchedRequests,
      mergedVariableCount: mergedCollection.variable.length,
    },
  };
}

function countRequests(items: any[]): number {
  let count = 0;

  for (const item of items || []) {
    if (item.request) {
      count += 1;
    }
    if (Array.isArray(item.item)) {
      count += countRequests(item.item);
    }
  }

  return count;
}

async function main() {
  const apiKey = requireEnv('POSTMAN_API_KEY');
  const collectionUid = requireCollectionUid();

  console.log('1) Exporting latest OpenAPI spec...');
  runOpenApiExport();

  console.log('2) Reading OpenAPI spec...');
  const openapi = readOpenApiSpec();

  console.log('3) Generating Postman collection from OpenAPI...');
  const generatedCollection = createGeneratedCollection(openapi);

  console.log('4) Downloading existing Postman collection...');
  const existingResponse = await postmanRequest<{ collection: Json }>(
    'GET',
    `/collections/${collectionUid}`,
    apiKey,
  );

  if (!existingResponse?.collection) {
    throw new Error('Postman API did not return a collection payload.');
  }

  console.log('5) Merging generated + existing collection data...');
  const { merged, stats } = mergeCollections(generatedCollection, existingResponse.collection);

  console.log('Merge stats:');
  console.log(`- generated requests: ${stats.generatedRequestCount}`);
  console.log(`- existing requests: ${stats.existingRequestCount}`);
  console.log(`- matched requests: ${stats.matchedRequestCount}`);
  console.log(`- merged variables: ${stats.mergedVariableCount}`);

  console.log('6) Pushing merged collection to Postman...');
  await postmanRequest('PUT', `/collections/${collectionUid}`, apiKey, {
    collection: merged,
  });

  console.log('Done: Postman collection updated successfully.');
}

main().catch((error) => {
  console.error('Postman sync failed.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
