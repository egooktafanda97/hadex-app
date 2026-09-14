import { AuthForm } from "@/components/auth-form";
export const metadata={title:"Masuk"};
export default function LoginPage(){return <main className="auth-shell"><section className="card auth-card"><span className="badge">Selamat datang</span><h1 className="text-3xl font-black my-3">Masuk ke HDEX</h1><p className="text-gray-600 mb-6">Kelola booking dan tiket perjalanan.</p><AuthForm mode="login"/></section></main>}
