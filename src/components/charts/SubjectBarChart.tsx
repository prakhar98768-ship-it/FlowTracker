"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
};

const axisProps = {
  tick: { fontSize: 12, fill: "var(--muted-foreground)" } as const,
  axisLine: false as const,
  tickLine: false as const,
};

interface BarChartItem {
  name: string;
  value: number;
  color: string;
}

interface Props {
  data: BarChartItem[];
  height?: number;
  layout?: "horizontal" | "vertical";
  domain?: [number, number];
  label?: string;
}

/** Reusable colored bar chart for subject comparison */
export function SubjectBarChart({
  data,
  height = 180,
  layout = "horizontal",
  domain = [0, 100],
  label = "Progress",
}: Props) {
  if (layout === "vertical") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" domain={domain} {...axisProps} />
          <YAxis type="category" dataKey="name" {...axisProps} width={80} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, label]} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="name" {...axisProps} />
        <YAxis domain={domain} {...axisProps} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, label]} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
