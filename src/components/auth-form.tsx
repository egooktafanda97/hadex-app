"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert, Button, Form, Input, Typography } from "antd";
import { loginAction,registerAction } from "@/app/actions/auth";

export function AuthForm({mode}:{mode:"login"|"register"}){const action=mode==="login"?loginAction:registerAction;const[state,formAction,pending]=useActionState(action,undefined);return <form action={formAction}><Form component={false} layout="vertical" size="large">{mode==="register"&&<><Form.Item label="Nama" required><Input name="name" autoComplete="name"/></Form.Item><Form.Item label="Nomor telepon" required><Input name="phone" placeholder="081234567890" autoComplete="tel"/></Form.Item></>}<Form.Item label="Email" required><Input name="email" type="email" autoComplete="email"/></Form.Item><Form.Item label="Password" required><Input.Password name="password" minLength={8} autoComplete={mode==="login"?"current-password":"new-password"}/></Form.Item>{state?.error&&<Alert className="mb-4" type="error" showIcon message={state.error}/>}<Button type="primary" htmlType="submit" loading={pending} block>{mode==="login"?"Masuk":"Buat akun"}</Button><Typography.Paragraph className="mt-4! text-center" type="secondary">{mode==="login"?"Belum punya akun? ":"Sudah punya akun? "}<Link className="font-bold" href={mode==="login"?"/register":"/login"}>{mode==="login"?"Daftar":"Masuk"}</Link></Typography.Paragraph></Form></form>}
