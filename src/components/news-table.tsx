'use client';

import Link from 'next/link';
import { Button, Table, Tag } from 'antd';
import { deleteNewsAction } from '@/app/actions/news';
import { formatDateTime } from '@/lib/format';

export type NewsRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
};

export function NewsTable({ rows }: { rows: NewsRow[] }) {
  const columns = [
    { title: 'Judul', dataIndex: 'title' },
    { title: 'Slug', dataIndex: 'slug' },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (value: string) => (
        <Tag color={value === 'published' ? 'green' : 'gold'}>
          {value === 'published' ? 'Terbit' : 'Draft'}
        </Tag>
      ),
    },
    {
      title: 'Diperbarui',
      dataIndex: 'updatedAt',
      render: (value: string) => formatDateTime(value),
    },
    {
      title: 'Aksi',
      render: (_value: unknown, row: NewsRow) => (
        <div className='flex gap-2'>
          <Link href={`/admin/news/${row.id}`}>
            <Button>Edit</Button>
          </Link>
          <form action={deleteNewsAction.bind(null, row.id)}>
            <Button danger htmlType='submit'>
              Hapus
            </Button>
          </form>
        </div>
      ),
    },
  ];

  return <Table rowKey='id' dataSource={rows} columns={columns} />;
}
