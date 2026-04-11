import { sql } from 'drizzle-orm';
import { db } from '../db/index';
import { SYSTEM_PERMISSIONS } from '../db/permissions';
import { permissions } from '../db/schema';

async function seedPermissions() {
  await db
    .insert(permissions)
    .values([...SYSTEM_PERMISSIONS])
    .onConflictDoUpdate({
      target: permissions.name,
      set: {
        description: sql`excluded.description`,
      },
    });

  console.log(`Seeded ${SYSTEM_PERMISSIONS.length} system permissions.`);
}

seedPermissions()
  .catch((error) => {
    console.error('Failed to seed system permissions.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    process.exit();
  });
