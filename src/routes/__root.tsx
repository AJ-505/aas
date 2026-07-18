/// <reference types="vite/client" />
import { Suspense, lazy, type ReactNode } from 'react'
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import { Toaster } from 'react-hot-toast'
import type { QueryClient } from '@tanstack/react-query'
import { AppShell } from '~/components/AppShell'
import appCss from '~/styles/app.css?url'

// Devtools are excluded from the production bundle and lazy-loaded in dev so
// they never block first paint.
const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null
  : lazy(async () => ({
      default: (await import('@tanstack/react-router-devtools')).TanStackRouterDevtools,
    }))

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Cedric Masters Autos' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <AppShell>
        <Outlet />
      </AppShell>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="flex h-screen flex-col">{children}</div>
        <Toaster position="top-right" />
        <Suspense fallback={null}>
          <TanStackRouterDevtools position="bottom-right" />
        </Suspense>
        <Scripts />
      </body>
    </html>
  )
}
