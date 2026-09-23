import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface ChannelChartProps {
  channelData: Array<{ channel: string; sent: number; color: string }>;
}

export const ChannelChart: React.FC<ChannelChartProps> = ({ channelData }) => {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-ink">Messaging Channels</h3>
          <p className="text-xs text-ink-soft">Volume across connected communication channels</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={channelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="channel"
              stroke="#8A93A6"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#E8E8F0' }}
            />
            <YAxis
              stroke="#8A93A6"
              fontSize={11}
              fontFamily="JetBrains Mono"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderColor: "#E8E8F0",
                borderRadius: "0.75rem",
                boxShadow: "0 8px 24px rgba(16,24,40,.10)",
                color: "#101828",
                fontSize: "0.875rem",
                fontFamily: "Inter"
              }}
              formatter={(value: any) => [`${value.toLocaleString()} messages`, "Volume"]}
            />
            <Bar dataKey="sent" radius={[6, 6, 0, 0]}>
              {channelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
