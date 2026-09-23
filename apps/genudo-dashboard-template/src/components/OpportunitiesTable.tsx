import React, { useState } from "react";
import { Search, Tag } from "lucide-react";

interface Opportunity {
  id: number;
  contact_name?: string;
  contact_identifier?: string;
  stage_name?: string;
  status: "active" | "won" | "lost" | "pending";
  value?: number;
  created_at?: string;
}

interface OpportunitiesTableProps {
  opportunities: Opportunity[];
}

export const OpportunitiesTable: React.FC<OpportunitiesTableProps> = ({ opportunities }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = opportunities.filter((op) => {
    const matchesSearch =
      (op.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.contact_identifier?.toLowerCase().includes(searchTerm.toLowerCase())) ??
      true;
    const matchesStatus = statusFilter === "all" || op.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "won":
        return "bg-success-50 text-success-600 border-success-500/20";
      case "active":
        return "bg-brand-50 text-brand-700 border-brand-200";
      case "lost":
        return "bg-danger-50 text-danger-600 border-danger-500/20";
      default:
        return "bg-canvas text-ink-muted border-line";
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-semibold text-ink">Recent Opportunities</h3>
          <p className="text-xs text-ink-soft">Real-time pipeline deals from GenuDo</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
            <input
              type="text"
              placeholder="Search contact or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-line bg-canvas pl-9 pr-4 py-2 text-xs text-ink placeholder-ink-muted focus:border-brand-400 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-line bg-canvas px-3 py-2 text-xs text-ink focus:border-brand-400 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-line text-ink-muted uppercase tracking-wider text-[11px]">
            <tr>
              <th className="pb-3 font-medium">Contact</th>
              <th className="pb-3 font-medium">Stage</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.slice(0, 10).map((op) => (
              <tr key={op.id} className="hover:bg-canvas/60 transition">
                <td className="py-3 font-medium text-ink">
                  <div>{op.contact_name || "Unknown Lead"}</div>
                  <div className="text-[11px] text-ink-muted font-mono font-normal">
                    {op.contact_identifier || `#${op.id}`}
                  </div>
                </td>
                <td className="py-3 text-ink-soft">
                  <span className="inline-flex items-center gap-1.5">
                    <Tag className="h-3 w-3 text-ink-muted" />
                    {op.stage_name || "Active"}
                  </span>
                </td>
                <td className="py-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getStatusBadge(
                      op.status
                    )}`}
                  >
                    {op.status}
                  </span>
                </td>
                <td className="py-3 text-right font-mono font-semibold text-ink">
                  {op.value ? `$${op.value.toLocaleString()}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
