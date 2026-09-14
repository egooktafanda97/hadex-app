'use client';

import { Button } from 'antd';

export function ReportPrintButton() {
  return (
    <Button type='primary' onClick={() => window.print()}>
      Cetak laporan
    </Button>
  );
}
