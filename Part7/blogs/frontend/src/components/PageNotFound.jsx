import { Link } from 'react-router-dom'

const PageNotFound = () => {
  return (
    <div className="not-found-view">
      <h2>Page not found</h2>
      <p>The page you requested does not exist.</p>
      <Link to="/">Go back to blogs</Link>
    </div>
  )
}

export default PageNotFound
