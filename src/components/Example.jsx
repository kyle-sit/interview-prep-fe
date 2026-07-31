/*
 * A plain JavaScript component, living alongside the TypeScript ones.
 *
 * It compiles because tsconfig.app.json sets `allowJs: true`, and it is never
 * type-checked because `checkJs` is false — note that `label` has no type
 * annotation and nothing complains.
 *
 * This file exists to prove that wiring works. Delete it whenever you like.
 */
export default function Example({ label }) {
  return <p>{label}</p>
}
