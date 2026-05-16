"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface DataPoint {
  label: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  height?: number;
  color?: string;
  dataLabel?: string;
}

/** Reusable area chart for weekly activity / trends */
export function ActivityChart({
  data,
  height = 180,
  color = "#8b5cf6",
  dataLabel = "Tasks",
}: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          fill={`url(#grad-${color})`}
          strokeWidth={2}
          name={dataLabel}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
