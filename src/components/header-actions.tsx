"use client";

import Link from "next/link";
import { Button, Space } from "antd";

export function HeaderActions({ dashboardUrl }: { dashboardUrl?: string }) {
  return (
    <Space size="large">
      <Link href="/schedule">Jadwal</Link>
      <Link href="/#layanan">Layanan</Link>
      {dashboardUrl ? <Link href={dashboardUrl}>Dashboard</Link> : <Link href="/login"><Button type="primary">Masuk</Button></Link>}
    </Space>
  );
}
