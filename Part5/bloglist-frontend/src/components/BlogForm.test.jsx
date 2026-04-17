import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

describe('BlogForm component', () => {
  test('calls onCreate with right details when creating a new blog', async () => {
    const user = userEvent.setup()
    const handleCreate = vi.fn()

    render(<BlogForm onCreate={handleCreate} onCancel={vi.fn()} />)

    await user.type(screen.getByRole('textbox', { name: /title/i }), 'Refactoring UI')
    await user.type(screen.getByRole('textbox', { name: /author/i }), 'Adam Wathan')
    await user.type(screen.getByRole('textbox', { name: /url/i }), 'https://example.com/refactoring-ui')

    await user.click(screen.getByRole('button', { name: 'create' }))

    expect(handleCreate).toHaveBeenCalledTimes(1)
    expect(handleCreate).toHaveBeenCalledWith({
      title: 'Refactoring UI',
      author: 'Adam Wathan',
      url: 'https://example.com/refactoring-ui',
    })
  })
})
