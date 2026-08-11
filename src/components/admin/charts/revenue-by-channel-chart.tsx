"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Both hues validated as a categorical pair via the dataviz skill's
// validate_palette.js against the card surface (#fffdfa): all checks pass
// (chroma floor, CVD separation, normal-vision floor, contrast). Retail is a
// more-saturated step of the brand saddle hue — the brand's own value
// (#8f652f) fails the chroma floor on its own, reading too close to gray to
// carry series identity. Wholesale borrows the reference palette's orange
// slot, chosen for compatibility with the warm brand hue.
const COLORS = { retail: "#9c5a1a", wholesale: "#eb6834" } as const;

export function RevenueByChannelChart({ retail, wholesale }: { retail: number; wholesale: number }) {
  const data = [
    { name: "Retail", value: retail, fill: COLORS.retail },
    { name: "Wholesale", value: wholesale, fill: COLORS.wholesale },
  ];

  return (
    <ResponsiveContainer width="100%" height={100}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 56, bottom: 4, left: 4 }} barCategoryGap={14}>
        <XAxis type="number" hide />
        {/* Category names on the axis are the identity channel here — a
            legend box would just repeat what's already labeled beside each
            bar, so it's intentionally omitted (never rely on color alone,
            but a label works as well as a swatch). */}
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          width={80}
          tick={{ fill: "#52514e", fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: "#f7f3ec" }}
          formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]}
          contentStyle={{ borderRadius: 4, borderColor: "#ddd1ba", fontSize: 12 }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            formatter={(value) => `$${Number(value).toFixed(2)}`}
            style={{ fill: "#2b2320", fontSize: 12, fontWeight: 500 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
