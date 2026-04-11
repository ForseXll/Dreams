interface CloudinaryResource {
  asset_id: string;
  public_id: string;
  format?: string;
  resource_type: string;
  type: string;
  secure_url: string;
  url: string;
  created_at: string;
  bytes: number;
}

interface CloudinaryResourcesResponse {
  next_cursor?: string;
  resources?: CloudinaryResource[];
}

interface ScriptOptions {
  out?: string;
  format: 'json' | 'txt';
  prefix?: string;
  resourceType: string;
  deliveryType: string;
  maxResults: number;
}

function getOption(name: string) {
  const index = process.argv.indexOf(`--${name}`);

  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

function parseOptions(): ScriptOptions {
  const formatOption = getOption('format');

  return {
    deliveryType: getOption('type') || 'upload',
    format: formatOption === 'txt' ? 'txt' : 'json',
    maxResults: Number(getOption('max-results') || '500'),
    out: getOption('out'),
    prefix: getOption('prefix'),
    resourceType: getOption('resource-type') || 'image',
  };
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function buildRequestUrl(cloudName: string, options: ScriptOptions, nextCursor?: string) {
  const url = new URL(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/${options.resourceType}/${options.deliveryType}`
  );

  url.searchParams.set('max_results', String(options.maxResults));

  if (options.prefix) {
    url.searchParams.set('prefix', options.prefix);
  }

  if (nextCursor) {
    url.searchParams.set('next_cursor', nextCursor);
  }

  return url;
}

async function fetchAllResources(
  cloudName: string,
  apiKey: string,
  apiSecret: string,
  options: ScriptOptions
) {
  const resources: CloudinaryResource[] = [];
  let nextCursor: string | undefined;

  do {
    const url = buildRequestUrl(cloudName, options, nextCursor);
    const authHeader = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${authHeader}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Cloudinary request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as CloudinaryResourcesResponse;
    resources.push(...(payload.resources || []));
    nextCursor = payload.next_cursor;
  } while (nextCursor);

  return resources;
}

async function writeOutput(options: ScriptOptions, resources: CloudinaryResource[]) {
  const fs = await import('node:fs/promises');
  const content = options.format === 'txt'
    ? resources.map((resource) => resource.secure_url).join('\n')
    : JSON.stringify(
        resources.map((resource) => ({
          assetId: resource.asset_id,
          bytes: resource.bytes,
          createdAt: resource.created_at,
          format: resource.format || '',
          publicId: resource.public_id,
          resourceType: resource.resource_type,
          secureUrl: resource.secure_url,
          type: resource.type,
          url: resource.url,
        })),
        null,
        2
      );

  if (!options.out) {
    console.log(content);
    return;
  }

  await fs.writeFile(options.out, `${content}\n`, 'utf8');
  console.error(`Wrote ${resources.length} Cloudinary URLs to ${options.out}`);
}

async function main() {
  const options = parseOptions();
  const cloudName = getRequiredEnv('CLOUDINARY_CLOUD_NAME');
  const apiKey = getRequiredEnv('CLOUDINARY_API_KEY');
  const apiSecret = getRequiredEnv('CLOUDINARY_API_SECRET');
  const resources = await fetchAllResources(cloudName, apiKey, apiSecret, options);

  console.error(`Found ${resources.length} Cloudinary resources.`);
  await writeOutput(options, resources);
}

main().catch((error) => {
  console.error('Failed to list Cloudinary URLs.');
  console.error(error);
  process.exitCode = 1;
});
