import { test as baseTest, APIRequestContext } from '@playwright/test';

// Worker-scoped fixture: token is fetched once per worker, shared across all
// tests running in that worker — avoids a login call before every test.
export const test = baseTest.extend<{}, { authToken: string }>({
    authToken: [
        async ({ playwright }, use) => {
            const request: APIRequestContext = await playwright.request.newContext({
                baseURL: process.env.BASE_URL || 'http://localhost:3000/',
            });

            const response = await request.post('/auth/login', {
                data: { username: 'admin_user', password: 'admin_pass' },
            });

            const { token } = await response.json();
            await request.dispose();

            await use(token);
        },
        { scope: 'worker' },
    ],
});

export { expect } from '@playwright/test';
