"use client";

import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Single series (nominal — product identity, not a ranked scale), so it
// takes one hue rather than a categorical set. Reuses saddle-700, the same
// tone the dashboard's StatTile already uses for its "warn" state, so a
// low-stock signal reads consistently in both places rather than
// introducing a second, unrelated warning color.
const COLOR = "#5e421f";

export function LowStockChart({ items }: { items: { name: string; totalStock: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(items.length * 32, 60)}>
      <BarChart data={items} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 4 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          width={110}
          tick={{ fill: "#52514e", fontSize: 12 }}
          tickFormatter={(name: string) => (name.length > 16 ? `${name.slice(0, 15)}…` : name)}
        />
        <Tooltip
          cursor={{ fill: "#f7f3ec" }}
          formatter={(value) => [`${Number(value)} left`, ""]}
          contentStyle={{ borderRadius: 4, borderColor: "#ddd1ba", fontSize: 12 }}
        />
        <Bar dataKey="totalStock" fill={COLOR} radius={[0, 4, 4, 0]} maxBarSize={20}>
          <LabelList
            dataKey="totalStock"
            position="right"
            formatter={(value) => `${value ?? ""} left`}
            style={{ fill: "#2b2320", fontSize: 12, fontWeight: 500 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
