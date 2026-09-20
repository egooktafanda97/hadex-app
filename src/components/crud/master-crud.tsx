'use client';

import { useActionState, useState } from 'react';
import {
  App,
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ActionResult } from '@/app/actions/master-data';
import { EntitySelect } from '@/components/crud/entity-select';
import { formatRupiah, toDatetimeLocalValue } from '@/lib/format';

type Field = {
  name: string;
  label: string;
  type?: 'number' | 'currency' | 'select' | 'datetime' | 'password';
  options?: { label: string; value: string }[];
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  /** For datetime create form: minutes offset from now when value empty. */
  defaultMinutesFromNow?: number;
};
type Row = Record<string, unknown> & {
  id: string;
  is_active?: number;
  status?: string;
};
function CurrencyInput({
  name,
  initialValue,
}: {
  name: string;
  initialValue: unknown;
}) {
  const [value, setValue] = useState<number | null>(
    initialValue == null ? null : Number(initialValue),
  );
  return (
    <>
      <InputNumber<number>
        className='w-full'
        style={{ width: '100%' }}
        min={0}
        precision={0}
        value={value}
        formatter={(current) =>
          current == null ? '' : formatRupiah(Number(current))
        }
        parser={(displayValue) => {
          const digits = (displayValue ?? '').replace(/\D/g, '');
          return digits ? Number(digits) : 0;
        }}
        onChange={setValue}
      />
      <input type='hidden' name={name} value={value ?? ''} />
    </>
  );
}

function datetimeDefault(field: Field, editing?: Row) {
  const raw = editing?.[field.name];
  if (raw != null && String(raw) !== '') {
    return toDatetimeLocalValue(String(raw));
  }
  if (editing) return '';
  return toDatetimeLocalValue(null, field.defaultMinutesFromNow ?? 0);
}

export function MasterCrud({
  title,
  rows,
  fields,
  action,
  toggleAction,
  cancelAction,
  table,
  model,
  path,
  toggleLabels,
}: {
  title: string;
  rows: Row[];
  fields: Field[];
  action: (
    state: ActionResult | undefined,
    data: FormData,
  ) => Promise<ActionResult>;
  toggleAction?: (data: FormData) => Promise<void>;
  cancelAction?: (data: FormData) => Promise<void>;
  table?: string;
  model?: string;
  path: string;
  toggleLabels?: { active: string; inactive: string; confirm: string };
}) {
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row>();
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, pending] = useActionState(
    async (previous, data) => {
      const response = await action(previous, data);
      if (response.ok) {
        message.success(response.message);
        setOpen(false);
        setEditing(undefined);
      } else {
        message.error(response.message);
      }
      return response;
    },
    undefined,
  );

  const openCreate = () => {
    setEditing(undefined);
    setFormKey((k) => k + 1);
    setOpen(true);
  };
  const openEdit = (row: Row) => {
    setEditing(row);
    setFormKey((k) => k + 1);
    setOpen(true);
  };

  const columns = [
    ...fields
      .filter((f) => f.type !== 'password')
      .map((f) => ({
        title: f.label,
        dataIndex: f.name,
        key: f.name,
        render: (v: unknown) =>
          f.name === 'is_active' ? (
            <Tag color={v ? 'green' : 'red'}>{v ? 'Aktif' : 'Nonaktif'}</Tag>
          ) : f.type === 'select' ? (
            f.options?.find((option) => option.value === String(v))?.label ??
            String(v ?? '-')
          ) : f.type === 'currency' ? (
            formatRupiah(Number(v ?? 0))
          ) : f.type === 'datetime' ? (
            v ? toDatetimeLocalValue(String(v)).replace('T', ' ') : '-'
          ) : (
            String(v ?? '-')
          ),
      })),
    {
      title: 'Aksi',
      key: 'actions',
      render: (_: unknown, row: Row) => (
        <Space>
          <Button onClick={() => openEdit(row)}>Edit</Button>
          {toggleAction && (
            <Popconfirm
              title={toggleLabels?.confirm ?? 'Ubah status data?'}
              onConfirm={async () => {
                const data = new FormData();
                data.set('id', row.id);
                if (table) data.set('table', table);
                if (model) data.set('model', model);
                data.set('path', path);
                await toggleAction(data);
              }}
            >
              <Button danger={Boolean(row.is_active)}>
                {row.is_active
                  ? toggleLabels?.active ?? 'Nonaktifkan'
                  : toggleLabels?.inactive ?? 'Aktifkan'}
              </Button>
            </Popconfirm>
          )}
          {cancelAction && row.status === 'scheduled' && (
            <form action={cancelAction}>
              <input type='hidden' name='id' value={row.id} />
              <Button danger htmlType='submit'>
                Batalkan
              </Button>
            </form>
          )}
        </Space>
      ),
    },
  ];
  return (
    <>
      <div className='mb-6 flex items-center justify-between'>
        <Typography.Title level={2} className='m-0!'>
          {title}
        </Typography.Title>
        <Button type='primary' onClick={openCreate}>
          Tambah
        </Button>
      </div>
      <Card>
        <Table
          rowKey='id'
          dataSource={rows}
          columns={columns}
          scroll={{ x: true }}
        />
      </Card>
      <Modal
        title={editing ? `Edit ${title}` : `Tambah ${title}`}
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <form action={formAction} key={`${editing?.id ?? 'new'}-${formKey}`}>
          <Form component={false} layout='vertical'>
            <input type='hidden' name='id' value={editing?.id ?? ''} />
            {fields
              .filter((f) => f.name !== 'is_active')
              .map((f) => (
                <Form.Item key={f.name} label={f.label} required={f.required}>
                  {f.type === 'currency' ? (
                    <CurrencyInput
                      key={`${editing?.id ?? 'new'}-${f.name}-${formKey}`}
                      name={f.name}
                      initialValue={editing?.[f.name]}
                    />
                  ) : f.type === 'number' ? (
                    <InputNumber
                      className='w-full'
                      name={f.name}
                      defaultValue={Number(editing?.[f.name] ?? 0)}
                    />
                  ) : f.type === 'select' ? (
                    <EntitySelect
                      name={f.name}
                      options={f.options ?? []}
                      initialValue={editing?.[f.name] as string | undefined}
                    />
                  ) : (
                    <Input
                      name={f.name}
                      type={
                        f.type === 'datetime'
                          ? 'datetime-local'
                          : f.type === 'password'
                            ? 'password'
                            : 'text'
                      }
                      required={f.required}
                      minLength={f.minLength}
                      maxLength={f.maxLength}
                      defaultValue={
                        f.type === 'datetime'
                          ? datetimeDefault(f, editing)
                          : String(editing?.[f.name] ?? '')
                      }
                    />
                  )}
                </Form.Item>
              ))}
            {state && (
              <Alert
                className='mb-4'
                type={state.ok ? 'success' : 'error'}
                title={state.message}
              />
            )}
            <Button type='primary' htmlType='submit' loading={pending} block>
              Simpan
            </Button>
          </Form>
        </form>
      </Modal>
    </>
  );
}
