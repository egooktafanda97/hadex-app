import Link from "next/link";
import { auth, signOut } from "@/auth";
import { HeaderActions } from "@/components/header-actions";
import { LogoutButton } from "@/components/logout-button";

export async function Header(){
 const session=await auth();
 return <header className="nav"><div className="container nav-inner"><Link className="logo" href="/">HDEX <span>TRANS</span></Link><nav className="flex items-center gap-4 font-semibold"><HeaderActions dashboardUrl={session?.user?`/${session.user.role}/dashboard`:undefined}/>{session?.user&&<form action={async()=>{"use server";await signOut({redirectTo:"/"})}}><LogoutButton/></form>}</nav></div></header>;
}
