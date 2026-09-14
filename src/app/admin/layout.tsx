import { requireUser } from "@/lib/dal";import { DashboardShell } from "@/components/dashboard-shell";
export default async function Layout({children}:{children:React.ReactNode}){const user=await requireUser(["admin"]);return <DashboardShell role="admin" name={user.name}>{children}</DashboardShell>}
