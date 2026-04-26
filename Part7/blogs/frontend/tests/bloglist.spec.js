const { test, expect, beforeEach, describe } = require('@playwright/test');

const apiBaseUrl = 'http://localhost:3003/api';

const loginWith = async (page, username, password) => {
  await page.goto('/login');
  await page.getByPlaceholder('username').fill(username);
  await page.getByPlaceholder('password').fill(password);
  await page.getByRole('button', { name: 'login' }).click();
};

const createBlog = async (page, { title, author, url }) => {
  await page.getByRole('button', { name: 'create new blog' }).click();
  await page.getByRole('textbox', { name: /title/i }).fill(title);
  await page.getByRole('textbox', { name: /author/i }).fill(author);
  await page.getByRole('textbox', { name: /url/i }).fill(url);
  await page.getByRole('button', { name: 'create' }).click();
};

const likeBlog = async (page, blogTitle) => {
  const blogLink = page.getByRole('link', { name: new RegExp(blogTitle) });
  await blogLink.click();
  
  const likeButton = page.getByRole('button', { name: 'like' });
  const currentLikes = await page.locator('text=Likes:').textContent();
  const likesBeforeClick = parseInt(currentLikes.match(/\d+/)[0]);
  
  await likeButton.click();
  
  await expect(page.locator('text=Likes:')).toContainText(`${likesBeforeClick + 1}`);
  
  // Navigate back to blogs
  await page.getByRole('link', { name: 'blogs' }).click();
};

const deleteBlog = async (page, blogTitle) => {
  const blogLink = page.getByRole('link', { name: new RegExp(blogTitle) });
  await blogLink.click();
  
  page.on('dialog', (dialog) => dialog.accept());
  
  const removeButton = page.getByRole('button', { name: 'remove' });
  await removeButton.click();
  
  await expect(page).toHaveURL('/');
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
    await page.getByRole('link', { name: 'login' }).click();
    
    await expect(page.getByPlaceholder('username')).toBeVisible();
    await expect(page.getByPlaceholder('password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'login' })).toBeVisible();
  });

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen');

      await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible();
      await expect(page).toHaveURL('/');
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

      await expect(page.getByRole('link', { name: /Playwright in Bloglist/ })).toBeVisible();
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

      await deleteBlog(page, 'Blog to delete');

      await expect(page.getByRole('link', { name: /Blog to delete/ })).not.toBeVisible();
    });
  });
});
