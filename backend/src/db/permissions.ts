export const SYSTEM_PERMISSIONS = [
  {
    name: 'ADMIN',
    description: 'Full administrative access across the application.',
  },
  {
    name: 'USER',
    description: 'Default account access for signed-in users.',
  },
  {
    name: 'ITEMCREATE',
    description: 'Can create new catalog items.',
  },
  {
    name: 'ITEMUPDATE',
    description: 'Can update any catalog item.',
  },
  {
    name: 'ITEMDELETE',
    description: 'Can delete any catalog item.',
  },
  {
    name: 'PERMISSIONUPDATE',
    description: 'Can manage other users and their permissions.',
  },
] as const;

export const SYSTEM_PERMISSION_NAMES = SYSTEM_PERMISSIONS.map((permission) => permission.name);
