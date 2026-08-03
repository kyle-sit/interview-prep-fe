import { Link, useLocation } from 'react-router'

export default function NotFound() {
  const { pathname } = useLocation()

  return (
    <>
      <h1>Not found</h1>
      <p>
        No route matches <code>{pathname}</code>.
      </p>
      <p>
        <Link to="/">Back to the index</Link>
      </p>
    </>
  )
}
