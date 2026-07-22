import { AppShell } from "./AppShell";

/** Layout da área administrativa (sidebar + proteção por isAdmin via AppShell). */
export function AdminShell({ children }) {
  return <AppShell variant="admin">{children}</AppShell>;
}
