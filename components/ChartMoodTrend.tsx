"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function ChartMoodTrend({
  data,
}: {
  data: { date: string; mood: number }[];
}) {
  return (
    <div className="h-64 rounded-[24px] bg-[rgba(255,255,255,0.55)] ring-1 ring-[rgba(0,0,0,0.06)] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="4 6" opacity={0.25} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={8} />
          <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12 }} tickMargin={8} />
          <Tooltip
            formatter={(v: any) => [`${v}`, "mood"]}
            labelFormatter={(label) => label}
          />
          <Line type="monotone" dataKey="mood" strokeWidth={3} dot={{ r: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
