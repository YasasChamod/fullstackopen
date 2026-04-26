const { test, expect, beforeEach, describe } = require('@playwright/test');

const apiBaseUrl = 'http://localhost:3003/api';

const loginWith = async (page, username, password) => {
  await page.getByPlaceholder('username').fill(username);
  await page.getByPlaceholder('password').fill(password);
  await page.getByRole('button', { name: 'login' }).click();
};

const createBlog = async (page, { title, author, url }) => {
  await page.getByRole('button', { name: 'new blog' }).click();
  await page.getByPlaceholder(/title/i).fill(title);
  await page.getByPlaceholder(/author/i).fill(author);
  await page.getByPlaceholder(/url/i).fill(url);
  await page.getByRole('button', { name: 'create' }).click();
};

const likeBlog = async (page, title, times = 1) => {
  const blog = page.locator('.blog', { hasText: title });
  await blog.getByRole('button', { name: 'view' }).click();

  for (let i = 0; i < times; i += 1) {
    await blog.getByRole('button', { name: 'like' }).click();
    await expect(blog.getByText(new RegExp(`likes\\s+${i + 1}`))).toBeVisible();
  }
};

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post(`${apiBaseUrl}/testing/reset`);

    await request.post(`${apiBaseUrl}/users`, {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen',
      },
    });

    await page.goto('/');
  });

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByPlaceholder('username')).toBeVisible();
    await expect(page.getByPlaceholder('password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible();
  });

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen');

      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible();
    });

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'wrong');

      await expect(page.getByText('wrong username or password')).toBeVisible();
      await expect(page.getByText('Matti Luukkainen logged in')).not.toBeVisible();
    });
  });

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen');
    });

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, {
        title: 'Playwright in Bloglist',
        author: 'Full Stack Open',
        url: 'https://fullstackopen.com',
      });

      await expect(page.getByText('Playwright in Bloglist Full Stack Open')).toBeVisible();
    });

    test('a blog can be liked', async ({ page }) => {
      await createBlog(page, {
        title: 'A blog to like',
        author: 'Author',
        url: 'https://example.com',
      });

      await likeBlog(page, 'A blog to like');
    });

    test('a blog can be deleted by the user who created it', async ({ page }) => {
      await createBlog(page, {
        title: 'Blog to delete',
        author: 'Author',
        url: 'https://example.com',
      });

      page.on('dialog', (dialog) => dialog.accept());

      const blog = page.locator('.blog', { hasText: 'Blog to delete' });
      await blog.getByRole('button', { name: 'view' }).click();
      await blog.getByRole('button', { name: 'remove' }).click();

      await expect(page.getByText('Blog to delete Author')).not.toBeVisible();
    });

    test('only creator sees the delete button', async ({ page, request }) => {
      await createBlog(page, {
        title: 'Creator only delete',
        author: 'Author',
        url: 'https://example.com',
      });

      await request.post(`${apiBaseUrl}/users`, {
        data: {
          name: 'Another User',
          username: 'another',
          password: 'salainen',
        },
      });

      await page.getByRole('button', { name: 'logout' }).click();
      await loginWith(page, 'another', 'salainen');

      const blog = page.locator('.blog', { hasText: 'Creator only delete' });
      await blog.getByRole('button', { name: 'view' }).click();

      await expect(blog.getByRole('button', { name: 'remove' })).toHaveCount(0);
    });

    test('blogs are ordered by likes descending', async ({ page }) => {
      await createBlog(page, {
        title: 'Most liked',
        author: 'Author',
        url: 'https://example.com/1',
      });

      await createBlog(page, {
        title: 'Least liked',
        author: 'Author',
        url: 'https://example.com/2',
      });

      await likeBlog(page, 'Most liked', 2);
      await likeBlog(page, 'Least liked', 1);

      const blogRows = page.locator('.blog');
      await expect(blogRows.nth(0)).toContainText('Most liked');
      await expect(blogRows.nth(1)).toContainText('Least liked');
    });
  });
});
