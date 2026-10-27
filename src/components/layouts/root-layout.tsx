import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"

/** Wraps every route: scroll reset. Shared state lives in the Redux store (see main.tsx). */
export function RootLayout() {
  return (
    <>
      <Outlet />
      <ScrollToTop />
    </>
  )
}

/** Starts each new page at the top; in-page `#anchor` links keep their own scrolling. */
function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
