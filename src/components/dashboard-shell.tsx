'use client';

import Link from 'next/link';
import { Avatar, Layout, Menu, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { Role } from '@/lib/permissions';

const links: Record<Role, [string, string][]> = {
  customer: [
    ['Dashboard', '/customer/dashboard'],
    ['Booking Saya', '/customer/bookings'],
    ['Tiket', '/customer/tickets'],
    ['Profil', '/customer/profile'],
  ],
  operator: [
    ['Dashboard', '/operator/dashboard'],
    ['Perjalanan', '/operator/trips'],
    ['Booking', '/operator/bookings'],
    ['Check-in QR', '/operator/checkin'],
  ],
  admin: [
    ['Dashboard', '/admin/dashboard'],
    ['Bus', '/admin/buses'],
    ['Lokasi', '/admin/locations'],
    ['Rute', '/admin/routes'],
    ['Perjalanan', '/admin/trips'],
    ['Booking', '/admin/bookings'],
    ['Pengguna', '/admin/users'],
    ['Operator', '/admin/operators'],
    ['Pembayaran', '/admin/payments'],
    ['Validasi Tiket', '/admin/tickets'],
    ['Audit Log', '/admin/audit-logs'],
    ['Berita', '/admin/news'],
    ['Laporan', '/admin/reports'],
  ],
  owner: [
    ['Dashboard', '/owner/dashboard'],
    ['Pendapatan', '/owner/revenue'],
    ['Perjalanan', '/owner/trips'],
    ['Booking', '/owner/bookings'],
    ['Laporan', '/owner/reports'],
  ],
};
export function DashboardShell({
  role,
  name,
  children,
}: {
  role: Role;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <Layout className='!min-h-[calc(100vh-72px)]'>
      <Layout.Sider
        breakpoint='lg'
        collapsedWidth='0'
        width={260}
        className='!bg-emerald-950 p-4'
      >
        <div className='mb-6 flex items-center gap-3'>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Typography.Text className='!text-white !font-bold'>
              {name}
            </Typography.Text>
            <Typography.Text className='!block !text-emerald-200 capitalize'>
              {role}
            </Typography.Text>
          </div>
        </div>
        <Menu
          theme='dark'
          mode='inline'
          className='!bg-transparent'
          items={links[role].map(([label, href]) => ({
            key: href,
            label: <Link href={href}>{label}</Link>,
          }))}
        />
      </Layout.Sider>
      <Layout.Content className='content !bg-stone-50'>
        {children}
      </Layout.Content>
    </Layout>
  );
}
