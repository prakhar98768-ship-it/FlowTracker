"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface PieSlice {
  name: string;
  value: number;
  color: string;
}

interface Props {
  data: PieSlice[];
}

/** Donut chart with legend for status distribution */
export function StatusPieChart({ data }: Props) {
  const filtered = data.filter((d) => d.value > 0);

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie
            data={filtered}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={65}
            paddingAngle={3}
            dataKey="value"
          >
            {filtered.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2">
        {filtered.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-xs">
              {d.name}: <strong>{d.value}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
