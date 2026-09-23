import React from "react";

interface Stage {
  id: number;
  name: string;
  order: number;
  opportunities_count?: number;
}

interface StageFunnelProps {
  stages: Stage[];
}

export const StageFunnel: React.FC<StageFunnelProps> = ({ stages }) => {
  const maxCount = Math.max(...stages.map((s) => s.opportunities_count || 1), 1);

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-ink">Pipeline Stage Funnel</h3>
          <p className="text-xs text-ink-soft">Active deal progression across sequential stages</p>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        {stages.map((stage) => {
          const count = stage.opportunities_count || 0;
          const percentage = Math.round((count / maxCount) * 100);

          return (
            <div key={stage.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-ink">{stage.name}</span>
                <span className="font-mono text-ink-muted font-medium">{count.toLocaleString()} leads</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-canvas overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-300"
                  style={{ width: `${Math.max(percentage, 3)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
