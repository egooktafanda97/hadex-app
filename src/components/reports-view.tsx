'use client';

import { Card, Col, Row, Statistic, Table, Tabs, Tag, Typography } from 'antd';
import { formatDateTime, formatRupiah } from '@/lib/format';
import { ReportPrintButton } from '@/components/report-print-button';

export type ScheduleReportRow = {
  id: string;
  tripCode: string;
  departureAt: string;
  arrivalAt: string;
  origin: string;
  destination: string;
  busCode: string;
  busName: string;
  plateNumber: string;
  capacity: number;
  bookedSeats: number;
  availableSeats: number;
  fare: number;
  status: string;
};
export type TripReportRow = ScheduleReportRow & {
  totalBookings: number;
  confirmedBookings: number;
  passengerCount: number;
  paidRevenue: number;
};
export type BusReportRow = {
  id: string;
  code: string;
  name: string;
  plateNumber: string;
  capacity: number;
  activeSeats: number;
  upcomingTrips: number;
  updatedAt: string;
};
const labels: Record<string, string> = {
  scheduled: 'Terjadwal',
  boarding: 'Naik Penumpang',
  departed: 'Berangkat',
  arrived: 'Tiba',
  cancelled: 'Dibatalkan',
};
const colors: Record<string, string> = {
  scheduled: 'blue',
  boarding: 'gold',
  departed: 'cyan',
  arrived: 'green',
  cancelled: 'red',
};

export function ReportsView({
  schedules,
  trips,
  buses,
  printedAt,
}: {
  schedules: ScheduleReportRow[];
  trips: TripReportRow[];
  buses: BusReportRow[];
  printedAt: string;
}) {
  const revenue = trips.reduce(
    (sum, trip) => sum + Number(trip.paidRevenue),
    0,
  );
  const status = (value: string) => (
    <Tag color={colors[value]}>{labels[value] ?? value}</Tag>
  );
  const schedule = (
    <section className='report-section'>
      <Typography.Title level={3}>Laporan Penjadwalan</Typography.Title>
      <Table
        rowKey='id'
        dataSource={schedules}
        pagination={false}
        scroll={{ x: 1500 }}
        columns={[
          { title: 'No.', render: (_v, _r, i) => i + 1 },
          { title: 'Kode Trip', dataIndex: 'tripCode' },
          {
            title: 'Berangkat',
            dataIndex: 'departureAt',
            render: formatDateTime,
          },
          { title: 'Tiba', dataIndex: 'arrivalAt', render: formatDateTime },
          {
            title: 'Rute',
            render: (_v, r) => `${r.origin} - ${r.destination}`,
          },
          { title: 'Bus', render: (_v, r) => `${r.busCode} - ${r.busName}` },
          { title: 'Nomor Plat', dataIndex: 'plateNumber' },
          { title: 'Kapasitas', dataIndex: 'capacity' },
          { title: 'Terpesan', dataIndex: 'bookedSeats' },
          { title: 'Tersedia', dataIndex: 'availableSeats' },
          { title: 'Tarif', dataIndex: 'fare', render: formatRupiah },
          { title: 'Status', dataIndex: 'status', render: status },
        ]}
      />
    </section>
  );
  const trip = (
    <section className='report-section'>
      <Typography.Title level={3}>Laporan Perjalanan</Typography.Title>
      <Table
        rowKey='id'
        dataSource={trips}
        pagination={false}
        scroll={{ x: 1500 }}
        columns={[
          { title: 'No.', render: (_v, _r, i) => i + 1 },
          { title: 'Kode Trip', dataIndex: 'tripCode' },
          {
            title: 'Berangkat',
            dataIndex: 'departureAt',
            render: formatDateTime,
          },
          {
            title: 'Rute',
            render: (_v, r) => `${r.origin} - ${r.destination}`,
          },
          { title: 'Bus', render: (_v, r) => `${r.busCode} - ${r.busName}` },
          { title: 'Nomor Plat', dataIndex: 'plateNumber' },
          { title: 'Tarif', dataIndex: 'fare', render: formatRupiah },
          { title: 'Total Booking', dataIndex: 'totalBookings' },
          { title: 'Terkonfirmasi', dataIndex: 'confirmedBookings' },
          { title: 'Penumpang', dataIndex: 'passengerCount' },
          {
            title: 'Pendapatan',
            dataIndex: 'paidRevenue',
            render: formatRupiah,
          },
          { title: 'Status', dataIndex: 'status', render: status },
        ]}
      />
    </section>
  );
  const bus = (
    <section className='report-section'>
      <Typography.Title level={3}>Laporan Data Bus Aktif</Typography.Title>
      <Table
        rowKey='id'
        dataSource={buses}
        pagination={false}
        scroll={{ x: 1000 }}
        columns={[
          { title: 'No.', render: (_v, _r, i) => i + 1 },
          { title: 'Kode Bus', dataIndex: 'code' },
          { title: 'Nama Bus', dataIndex: 'name' },
          { title: 'Nomor Plat', dataIndex: 'plateNumber' },
          { title: 'Kapasitas', dataIndex: 'capacity' },
          { title: 'Kursi Aktif', dataIndex: 'activeSeats' },
          { title: 'Jadwal Mendatang', dataIndex: 'upcomingTrips' },
          {
            title: 'Diperbarui',
            dataIndex: 'updatedAt',
            render: formatDateTime,
          },
        ]}
      />
    </section>
  );
  return (
    <div className='report-print-root'>
      <div className='report-toolbar'>
        <div>
          <Typography.Title level={2} className='mb-1!'>
            Laporan Operasional
          </Typography.Title>
          <Typography.Text type='secondary'>
            Pilih satu tab laporan untuk dilihat atau dicetak.
          </Typography.Text>
        </div>
        <ReportPrintButton />
      </div>
      <div className='report-print-header'>
        <strong>HDEX TRANS</strong>
        <span>Dicetak: {printedAt}</span>
      </div>
      <Row gutter={[16, 16]} className='report-summary'>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title='Jadwal Aktif' value={schedules.length} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title='Bus Aktif' value={buses.length} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title='Pendapatan Dibayar'
              value={formatRupiah(revenue)}
            />
          </Card>
        </Col>
      </Row>
      <Tabs
        className='report-tabs'
        destroyOnHidden
        items={[
          { key: 'schedule', label: 'Penjadwalan', children: schedule },
          { key: 'trip', label: 'Perjalanan', children: trip },
          { key: 'bus', label: 'Bus Aktif', children: bus },
        ]}
      />
    </div>
  );
}
