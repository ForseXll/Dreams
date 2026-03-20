import { expect, test } from '@playwright/test';

const guestUserResponse = { error: 'Unauthorized' };

function mockGuestSession(page) {
  return page.route('**/auth/me', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify(guestUserResponse),
    });
  });
}

test('shop page renders items from the REST API', async ({ page }) => {
  await mockGuestSession(page);
  await page.route('**/api/items**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 101,
            title: 'Nebula Lamp',
            description: 'Ambient light for late-night browsing.',
            image: 'https://example.com/lamp.jpg',
            largeImage: 'https://example.com/lamp-large.jpg',
            price: 12900,
            userId: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        total: 1,
        skip: 0,
        take: 4,
      }),
    });
  });

  await page.goto('/shop');

  await expect(page.getByText('Nebula Lamp')).toBeVisible();
  await expect(page.getByText('Ambient light for late-night browsing.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Dreams' })).toBeVisible();
});

test('signup page shows the auth forms', async ({ page }) => {
  await mockGuestSession(page);

  await page.goto('/signup');

  await expect(page.getByRole('heading', { name: 'Sign Up for an Account' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sign In to your Account' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Request a Password Reset' })).toBeVisible();
});

test('account page renders authenticated user details', async ({ page }) => {
  await page.route('**/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 7,
        name: 'Morgan',
        email: 'morgan@example.com',
        permissions: ['USER', 'PERMISSIONUPDATE'],
      }),
    });
  });

  await page.route('**/api/cart', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        cartItems: [],
        total: 0,
        itemCount: 0,
      }),
    });
  });

  await page.goto('/account');

  await expect(page.getByRole('heading', { name: 'Account Info' })).toBeVisible();
  await expect(page.getByText('Hello Morgan!')).toBeVisible();
  await expect(page.getByText('Permissions: USER, PERMISSIONUPDATE')).toBeVisible();
});
