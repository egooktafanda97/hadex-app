import { AuthForm } from "@/components/auth-form";
export const metadata={title:"Daftar"};
export default function RegisterPage(){return <main className="auth-shell"><section className="card auth-card"><span className="badge">Akun pelanggan</span><h1 className="text-3xl font-black my-3">Mulai perjalanan</h1><p className="text-gray-600 mb-6">Daftar untuk booking dan menerima e-ticket.</p><AuthForm mode="register"/></section></main>}
