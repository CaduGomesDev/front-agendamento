import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

/** Layout da área do cliente. As páginas cuidam do próprio shell/visual. */
function AppLayout() {
  return <Outlet />;
}
