import type { ComponentType } from 'react'
import Form from '../components/Form/Form.jsx'

export type PracticeRoute = {
  /** URL segment, no leading slash. */
  path: string
  /** Shown in the nav bar and on the home index. */
  label: string
  Component: ComponentType
}

/**
 * Single source of truth for practice components.
 *
 * Adding an entry here wires up the route, the nav link, and the home
 * index all at once — nothing else needs to change.
 */
export const practiceRoutes: PracticeRoute[] = [
  { path: 'form', label: 'Form', Component: Form },
]
