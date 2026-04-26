import { create } from 'zustand'
import blogService from '../services/blogs'

const sortBlogsByLikes = (blogs) => [...blogs].sort((a, b) => b.likes - a.likes)

const useBlogStore = create((set, get) => ({
  blogs: [],

  initializeBlogs: async () => {
    const blogs = await blogService.getAll()
    set({ blogs: sortBlogsByLikes(blogs) })
  },

  createBlog: async (blogObject) => {
    const newBlog = await blogService.create(blogObject)
    const { blogs } = get()
    set({ blogs: sortBlogsByLikes(blogs.concat(newBlog)) })
    return newBlog
  },

  likeBlog: async (blogToLike) => {
    const updatedBlogData = {
      user: blogToLike.user?.id || blogToLike.user?._id || blogToLike.user,
      likes: blogToLike.likes + 1,
      author: blogToLike.author,
      title: blogToLike.title,
      url: blogToLike.url,
      comments: blogToLike.comments || [],
    }

    const updatedBlog = await blogService.update(blogToLike.id, updatedBlogData)
    const blogWithUser = {
      ...updatedBlog,
      user: typeof updatedBlog.user === 'object' ? updatedBlog.user : blogToLike.user,
    }

    const { blogs } = get()
    set({
      blogs: sortBlogsByLikes(
        blogs.map((blog) => (blog.id === blogToLike.id ? blogWithUser : blog))
      ),
    })

    return blogWithUser
  },

  removeBlog: async (blogToRemove) => {
    await blogService.remove(blogToRemove.id)
    const { blogs } = get()
    set({ blogs: blogs.filter((blog) => blog.id !== blogToRemove.id) })
  },

  addComment: async (blogId, comment) => {
    const updatedBlog = await blogService.addComment(blogId, comment)
    const { blogs } = get()

    set({
      blogs: sortBlogsByLikes(
        blogs.map((blog) => (blog.id === blogId ? updatedBlog : blog))
      ),
    })

    return updatedBlog
  },
}))

export default useBlogStore
