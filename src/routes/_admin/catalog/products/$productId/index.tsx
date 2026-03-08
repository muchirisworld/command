import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_admin/catalog/products/$productId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_admin/catalog/products/$productId/"!</div>
}
