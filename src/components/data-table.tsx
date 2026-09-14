"use client";

import { Card, Empty, Table, Typography } from "antd";

export function DataTable({ title, rows }: { title: string; rows: Record<string, unknown>[] }) {
  const keys = rows[0] ? Object.keys(rows[0]) : [];
  const data = rows.map((row, index) => ({ ...row, key: index }));
  const columns = keys.map((key) => ({ title: key.replaceAll("_", " ").toUpperCase(), dataIndex: key, key, render: (value: unknown) => String(value ?? "-") }));
  return <><Typography.Title level={2}>{title}</Typography.Title><Card>{rows.length ? <Table dataSource={data} columns={columns} scroll={{ x: true }} pagination={{ pageSize: 10, showSizeChanger: false }}/> : <Empty description="Belum ada data"/>}</Card></>;
}
