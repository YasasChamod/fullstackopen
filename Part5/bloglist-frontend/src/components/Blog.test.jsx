import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Blog from './Blog'

const blog = {
  id: '123',
  title: 'Testing React components',
  author: 'Ada Lovelace',
  url: 'https://example.com/testing-react',
  likes: 42,
  user: {
    id: 'user-ada',
    name: 'Ada Lovelace',
    username: 'adalove',
  },
}

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('Blog component', () => {
  test('displays blog information and likes to unauthenticated users without buttons', () => {
    renderWithRouter(
      <Blog
        blog={blog}
        user={null}
        onLike={vi.fn()}
        onRemove={vi.fn()}
        canRemove={false}
      />
    )

    const title = screen.getByText(/Testing React components/)
    expect(title).toBeInTheDocument()

    // Click view to see details
    const viewButton = screen.getByRole('button', { name: 'view' })
    expect(viewButton).toBeInTheDocument()
  })

  test('shows url and likes when view button is clicked (unauthenticated)', async () => {
    const user = userEvent.setup()

    renderWithRouter(
      <Blog
        blog={blog}
        user={null}
        onLike={vi.fn()}
        onRemove={vi.fn()}
        canRemove={false}
      />
    )

    await user.click(screen.getByRole('button', { name: 'view' }))

    expect(screen.getByText(blog.url)).toBeInTheDocument()
    expect(screen.getByText(`likes ${blog.likes}`)).toBeInTheDocument()
    
    // Should not have like button for unauthenticated user
    expect(screen.queryByRole('button', { name: 'like' })).not.toBeInTheDocument()
  })

  test('authenticated non-creator user sees only like button', async () => {
    const user = userEvent.setup()
    const authenticatedUser = {
      id: 'user-bob',
      name: 'Bob Smith',
      username: 'bobsmith',
    }

    renderWithRouter(
      <Blog
        blog={blog}
        user={authenticatedUser}
        onLike={vi.fn()}
        onRemove={vi.fn()}
        canRemove={false}
      />
    )

    await user.click(screen.getByRole('button', { name: 'view' }))

    // Should have like button
    expect(screen.getByRole('button', { name: 'like' })).toBeInTheDocument()
    
    // Should not have remove button
    expect(screen.queryByRole('button', { name: 'remove' })).not.toBeInTheDocument()
  })

  test('blog creator sees both like and delete buttons', async () => {
    const user = userEvent.setup()
    const creator = {
      id: 'user-ada',
      name: 'Ada Lovelace',
      username: 'adalove',
    }

    renderWithRouter(
      <Blog
        blog={blog}
        user={creator}
        onLike={vi.fn()}
        onRemove={vi.fn()}
        canRemove={true}
      />
    )

    await user.click(screen.getByRole('button', { name: 'view' }))

    // Should have like button
    expect(screen.getByRole('button', { name: 'like' })).toBeInTheDocument()
    
    // Should have remove button
    expect(screen.getByRole('button', { name: 'remove' })).toBeInTheDocument()
  })

  test('calls like handler when like button is clicked', async () => {
    const user = userEvent.setup()
    const handleLike = vi.fn()
    const authenticatedUser = {
      id: 'user-bob',
      name: 'Bob',
      username: 'bob',
    }

    renderWithRouter(
      <Blog
        blog={blog}
        user={authenticatedUser}
        onLike={handleLike}
        onRemove={vi.fn()}
        canRemove={false}
      />
    )

    await user.click(screen.getByRole('button', { name: 'view' }))
    await user.click(screen.getByRole('button', { name: 'like' }))

    expect(handleLike).toHaveBeenCalled()
  })

  test('calls remove handler when remove button is clicked', async () => {
    const user = userEvent.setup()
    const handleRemove = vi.fn()
    const creator = {
      id: 'user-ada',
      name: 'Ada',
      username: 'ada',
    }

    renderWithRouter(
      <Blog
        blog={blog}
        user={creator}
        onLike={vi.fn()}
        onRemove={handleRemove}
        canRemove={true}
      />
    )

    await user.click(screen.getByRole('button', { name: 'view' }))
    await user.click(screen.getByRole('button', { name: 'remove' }))

    expect(handleRemove).toHaveBeenCalled()
  })
})
