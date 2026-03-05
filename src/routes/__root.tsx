import { shadcn } from '@clerk/themes'
import { ClerkProvider } from '@clerk/tanstack-react-start'
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClientProvider } from '@tanstack/react-query'

import appCss from '../styles.css?url'
import { NotFoundPage } from '@/components/elements/not-found'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { RouterContext } from '@/router'

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Liquor OS Command',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  notFoundComponent: NotFoundPage,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { queryClient } = Route.useRouteContext()

  return (
    <ClerkProvider
      appearance={{
        theme: shadcn,
        layout: {
          socialButtonsPlacement: 'bottom',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <html lang="en">
          <head>
            <HeadContent />
          </head>
          <body>
            <TooltipProvider>
              {children}
            </TooltipProvider>
            <TanStackDevtools
              config={{
                position: 'bottom-right',
              }}
              plugins={[
                {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
            <Scripts />
          </body>
        </html>
      </QueryClientProvider>
    </ClerkProvider>
  )
}
