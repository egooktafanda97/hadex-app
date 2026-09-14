'use client';

import { useActionState } from 'react';
import {
  CheckCircleOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Tag,
  Typography,
} from 'antd';
import { updateProfileAction } from '@/app/actions/customer';

export function ProfileForm({
  name,
  email,
  phone,
}: {
  name: string;
  email: string;
  phone: string;
}) {
  const [state, action, pending] = useActionState(
    updateProfileAction,
    undefined,
  );
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className='profile-page'>
      <header className='profile-heading'>
        <div>
          <span className='customer-eyebrow'>Pengaturan akun</span>
          <Typography.Title level={2} className='my-2!'>
            Profil Saya
          </Typography.Title>
          <Typography.Text type='secondary'>
            Kelola informasi pribadi untuk kebutuhan booking dan tiket.
          </Typography.Text>
        </div>
        <Tag color='green' icon={<CheckCircleOutlined />}>
          Akun Aktif
        </Tag>
      </header>

      <div className='profile-layout'>
        <aside className='profile-identity-card'>
          <Avatar size={88} className='profile-avatar'>
            {initials || <UserOutlined />}
          </Avatar>
          <h2>{name}</h2>
          <p>{email}</p>
          <Tag color='green'>Customer</Tag>
          <div className='profile-identity-meta'>
            <div>
              <MailOutlined />
              <span>
                <small>Email terdaftar</small>
                <b>{email}</b>
              </span>
            </div>
            <div>
              <PhoneOutlined />
              <span>
                <small>Nomor telepon</small>
                <b>{phone || 'Belum dilengkapi'}</b>
              </span>
            </div>
          </div>
          <div className='profile-security-note'>
            <LockOutlined />
            <span>
              <b>Data akun terlindungi</b>
              <small>Email tidak dapat diubah dari halaman ini.</small>
            </span>
          </div>
        </aside>

        <Card
          className='profile-form-card'
          title='Informasi Pribadi'
          extra={
            <Typography.Text type='secondary'>
              Data penumpang utama
            </Typography.Text>
          }
        >
          <Form
            component='form'
            action={action}
            layout='vertical'
            requiredMark='optional'
            size='large'
          >
            <Form.Item
              label='Nama lengkap'
              required
              extra='Gunakan nama sesuai identitas resmi.'
            >
              <Input
                prefix={<UserOutlined />}
                name='name'
                defaultValue={name}
                minLength={2}
                maxLength={80}
                placeholder='Masukkan nama lengkap'
              />
            </Form.Item>
            <Form.Item label='Alamat email'>
              <Input prefix={<MailOutlined />} value={email} disabled />
            </Form.Item>
            <Form.Item
              label='Nomor telepon'
              required
              extra='Digunakan untuk informasi booking dan perjalanan.'
            >
              <Input
                prefix={<PhoneOutlined />}
                name='phone'
                defaultValue={phone}
                minLength={9}
                maxLength={16}
                placeholder='Contoh: 081234567890'
              />
            </Form.Item>
            {state && (
              <Alert
                className='mb-5'
                showIcon
                type={state.ok ? 'success' : 'error'}
                title={state.message}
              />
            )}
            <div className='profile-form-actions'>
              <Typography.Text type='secondary'>
                Pastikan informasi sudah benar sebelum disimpan.
              </Typography.Text>
              <Button type='primary' htmlType='submit' loading={pending}>
                {pending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}
