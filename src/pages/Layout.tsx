import { NavLink, Outlet } from 'react-router'
import { practiceRoutes } from '../routes/routes'
import './Layout.css'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'nav-link nav-link--active' : 'nav-link'

export default function Layout() {
  return (
    <>
      <nav className="nav">
        <NavLink to="/" end className={linkClass}>
          Index
        </NavLink>
        {practiceRoutes.map(({ path, label }) => (
          <NavLink key={path} to={`/${path}`} className={linkClass}>
            {label}
          </NavLink>
        ))}
      </nav>

      <main className="content">
        <Outlet />
      </main>
    </>
  )
}
