import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/inventory/receive')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/inventory/receive"!</div>
}
