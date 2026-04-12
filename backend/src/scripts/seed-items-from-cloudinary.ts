import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import { items, users } from '../db/schema';

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
  prefix?: string;
  resourceType: string;
  deliveryType: string;
  maxResults: number;
}

const TITLE_PREFIXES = [
  'Dream',
  'Velvet',
  'Golden',
  'Neon',
  'Silent',
  'Wild',
  'Electric',
  'Midnight',
  'Soft',
  'Wandering',
];

const TITLE_SUBJECTS = [
  'Memory',
  'Echo',
  'Portrait',
  'Postcard',
  'Bloom',
  'Artifact',
  'Scene',
  'Souvenir',
  'Moment',
  'Light',
];

const TITLE_SUFFIXES = [
  'Collection',
  'Study',
  'Series',
  'Edition',
  'Archive',
  'No. 1',
  'No. 2',
  'No. 3',
  'Print',
  'Object',
];

const DESCRIPTION_OPENERS = [
  'Collected from a cloud diary and turned into a shop-ready listing.',
  'A found image repurposed as a catalog piece with a bit of narrative weight.',
  'Sourced from the diary archive and framed as a one-off keepsake.',
  'An atmospheric image lifted from the diary feed and offered as an object.',
  'A casual diary capture presented like a small collectible.',
];

const DESCRIPTION_DETAILS = [
  'Works well as a conversation piece in a dense, image-driven collection.',
  'Feels like something between a snapshot, a relic, and a personal artifact.',
  'The composition carries enough texture to feel deliberate without losing its candid quality.',
  'It has the kind of visual pull that makes it easy to place in a curated storefront.',
  'Best suited for shoppers who like items that feel discovered rather than manufactured.',
];

function getOption(name: string) {
  const index = process.argv.indexOf(`--${name}`);

  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

function parseOptions(): ScriptOptions {
  return {
    deliveryType: getOption('type') || 'upload',
    maxResults: Number(getOption('max-results') || '500'),
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

function pickRandom(values: string[], seed: number) {
  return values[seed % values.length];
}

function createTitle(resource: CloudinaryResource, index: number) {
  const seed = resource.asset_id.length + index;
  const prefix = pickRandom(TITLE_PREFIXES, seed);
  const subject = pickRandom(TITLE_SUBJECTS, seed + 3);
  const suffix = pickRandom(TITLE_SUFFIXES, seed + 7);

  return `${prefix} ${subject} ${suffix}`;
}

function createDescription(resource: CloudinaryResource, index: number) {
  const opener = pickRandom(DESCRIPTION_OPENERS, resource.bytes + index);
  const detail = pickRandom(DESCRIPTION_DETAILS, resource.public_id.length + index);

  return `${opener} ${detail}`;
}

function createPrice(resource: CloudinaryResource, index: number) {
  const dollars = 35 + ((resource.bytes + index * 17) % 215);
  return dollars * 100;
}

async function seedItemsFromCloudinary() {
  const options = parseOptions();
  const cloudName = getRequiredEnv('CLOUDINARY_CLOUD_NAME');
  const apiKey = getRequiredEnv('CLOUDINARY_API_KEY');
  const apiSecret = getRequiredEnv('CLOUDINARY_API_SECRET');

  const user = await db.query.users.findFirst({
    where: eq(users.id, 1),
  });

  if (!user) {
    console.error('User with id=1 was not found. Exiting without creating items.');
    return;
  }

  const resources = await fetchAllResources(cloudName, apiKey, apiSecret, options);

  if (resources.length === 0) {
    console.log('No Cloudinary resources found. Nothing to seed.');
    return;
  }

  const itemValues = resources.map((resource, index) => ({
    title: createTitle(resource, index),
    description: createDescription(resource, index),
    image: resource.secure_url,
    largeImage: resource.secure_url,
    price: createPrice(resource, index),
    userId: user.id,
  }));

  const insertedItems = await db.insert(items).values(itemValues).returning({
    id: items.id,
  });

  console.log(
    `Created ${insertedItems.length} items for user ${user.id} (${user.email}) from ${resources.length} Cloudinary images.`
  );
}

seedItemsFromCloudinary()
  .catch((error) => {
    console.error('Failed to seed items from Cloudinary.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    process.exit();
  });
