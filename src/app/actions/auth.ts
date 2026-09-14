"use server";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { db } from "@/lib/db";
import { loginSchema, registerSchema } from "@/schemas/auth";

export async function loginAction(_state:{error?:string}|undefined,formData:FormData){const parsed=loginSchema.safeParse({email:formData.get("email"),password:formData.get("password")});if(!parsed.success)return {error:parsed.error.issues[0]?.message??"Data login tidak valid"};const user=db.prepare("SELECT role,is_active FROM users WHERE email=?").get(parsed.data.email) as {role:string;is_active:number}|undefined;if(!user?.is_active)return {error:"Email atau password salah"};try{await signIn("credentials",{email:parsed.data.email,password:parsed.data.password,redirectTo:`/${user.role}/dashboard`})}catch(error){if(error instanceof AuthError)return {error:"Email atau password salah"};throw error}}
export async function registerAction(_state:{error?:string}|undefined,formData:FormData){const parsed=registerSchema.safeParse(Object.fromEntries(formData));if(!parsed.success)return {error:parsed.error.issues[0]?.message};const exists=db.prepare("SELECT 1 FROM users WHERE email=?").get(parsed.data.email);if(exists)return {error:"Email sudah terdaftar"};const now=new Date().toISOString();db.prepare(`INSERT INTO users (id,name,email,phone,password_hash,role,is_active,created_at,updated_at) VALUES (?,?,?,?,?,'customer',1,?,?)`).run(crypto.randomUUID(),parsed.data.name,parsed.data.email,parsed.data.phone,await bcrypt.hash(parsed.data.password,12),now,now);redirect("/login?registered=1")}
