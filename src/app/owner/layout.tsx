import { requireUser } from "@/lib/dal";import { DashboardShell } from "@/components/dashboard-shell";
export default async function Layout({children}:{children:React.ReactNode}){const user=await requireUser(["owner"]);return <DashboardShell role="owner" name={user.name}>{children}</DashboardShell>}
