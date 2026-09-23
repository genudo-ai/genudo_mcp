import React from "react";
import { TrendingUp, Users, MessageSquare, DollarSign } from "lucide-react";

interface MetricCardsProps {
  summary: {
    total_opportunities?: number;
    active_opportunities?: number;
    won_opportunities?: number;
    lost_opportunities?: number;
    total_messages?: number;
    total_messages_cost?: number;
    cost_per_deal?: number;
  };
}

export const MetricCards: React.FC<MetricCardsProps> = ({ summary }) => {
  const cards = [
    {
      title: "Total Won Deals",
      value: summary.won_opportunities?.toLocaleString() ?? "0",
      subtext: `From ${summary.total_opportunities?.toLocaleString() ?? "0"} total leads`,
      icon: TrendingUp,
      iconBg: "bg-success-50 text-success-600",
      badge: "Won",
      badgeClass: "bg-success-50 text-success-600"
    },
    {
      title: "Active Pipeline Leads",
      value: summary.active_opportunities?.toLocaleString() ?? "0",
      subtext: "Currently progressing through stages",
      icon: Users,
      iconBg: "bg-brand-50 text-brand-600",
      badge: "Active",
      badgeClass: "bg-brand-50 text-brand-700"
    },
    {
      title: "Total Message Volume",
      value: summary.total_messages?.toLocaleString() ?? "0",
      subtext: "Across WhatsApp, Messenger, IG & Web",
      icon: MessageSquare,
      iconBg: "bg-brand-50 text-brand-600",
      badge: "Channels",
      badgeClass: "bg-canvas text-ink-soft"
    },
    {
      title: "Cost Per Deal",
      value: summary.cost_per_deal ? `$${summary.cost_per_deal.toFixed(2)}` : "$0.00",
      subtext: `Total message cost: $${summary.total_messages_cost ? summary.total_messages_cost.toFixed(2) : "0.00"}`,
      icon: DollarSign,
      iconBg: "bg-warn-50 text-warn-600",
      badge: "Acquisition",
      badgeClass: "bg-warn-50 text-warn-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="rounded-2xl border border-line bg-surface p-4 shadow-card hover:shadow-lift transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                {c.title}
              </span>
              <div className={`rounded-xl p-2.5 ${c.iconBg}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-semibold tracking-tight text-ink">
                {c.value}
              </span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${c.badgeClass}`}>
                {c.badge}
              </span>
            </div>
            <p className="mt-2 text-xs font-sans text-ink-muted">{c.subtext}</p>
          </div>
        );
      })}
    </div>
  );
};
