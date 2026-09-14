"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider } from "antd";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#f47b35",
            colorInfo: "#123c2c",
            borderRadius: 12,
            fontFamily: "Arial, Helvetica, sans-serif",
          },
          components: {
            Button: { controlHeight: 42, fontWeight: 700 },
            Card: { borderRadiusLG: 20 },
            Input: { controlHeight: 42 },
            Select: { controlHeight: 42 },
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
