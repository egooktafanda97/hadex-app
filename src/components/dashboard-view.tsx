'use client';

import { Alert, Card, Col, Row, Statistic, Tag, Typography } from 'antd';
import type { Role } from '@/lib/permissions';

export function DashboardView({
  role,
  title,
  stats,
}: {
  role: Role;
  title: string;
  stats: { title: string; value: string | number }[];
}) {
  return (
    <>
      <Tag color='green'>DASHBOARD {role.toUpperCase()}</Tag>
      <Typography.Title level={2} className='mt-3!'>
        {title}
      </Typography.Title>
      <Row gutter={[16, 16]} className='my-6!'>
        {stats.map((stat) => (
          <Col xs={24} sm={12} xl={6} key={stat.title}>
            <Card hoverable>
              <Statistic title={stat.title} value={stat.value} />
            </Card>
          </Col>
        ))}
      </Row>
      <Alert
        type='success'
        showIcon
        title='Status sistem'
        description='Data kursi, booking, pembayaran, dan tiket terhubung dalam alur terkontrol.'
      />
    </>
  );
}
