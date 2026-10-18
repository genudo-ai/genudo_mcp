import React from "react";
import { Users, Clock, AlertTriangle, Mic, MessageSquare, ShieldCheck, CheckCircle2 } from "lucide-react";

export interface WhatsAppGroupItem {
  id: string;
  subject: string;
  participants_count?: number;
  last_message?: string;
  last_activity_time?: string;
  response_time_minutes?: number;
  has_unanswered?: boolean;
  voice_notes_count?: number;
}

interface WhatsAppGroupMonitorProps {
  groups: WhatsAppGroupItem[];
  avgResponseMinutes?: number;
  unansweredCount?: number;
  onSendAlert?: (groupId: string) => void;
}

export const WhatsAppGroupMonitor: React.FC<WhatsAppGroupMonitorProps> = ({
  groups,
  avgResponseMinutes = 4.8,
  unansweredCount = 1,
  onSendAlert
}) => {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 sm:p-6 shadow-card flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-success-50 text-success-600 flex items-center justify-center border border-success-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-ink">ROZ WhatsApp Groups & Quality Control</h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-success-50 text-success-600 font-semibold border border-success-500/20 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> WhatsApp QR Active
              </span>
            </div>
            <p className="text-xs text-ink-soft">
              Real-time monitoring of team response SLA, group deal rooms, and voice note compliance
            </p>
          </div>
        </div>

        {/* Quick Summary Badges */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-canvas border border-line flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-brand-600" />
            <span className="text-xs text-ink-muted">Avg SLA:</span>
            <span className="text-xs font-mono font-bold text-ink">{avgResponseMinutes.toFixed(1)}m</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-danger-50 border border-danger-500/20 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-danger-600" />
            <span className="text-xs text-danger-600">Pending:</span>
            <span className="text-xs font-mono font-bold text-danger-600">{unansweredCount}</span>
          </div>
        </div>
      </div>

      {/* Monitored Groups List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-line text-ink-muted font-medium bg-canvas/60">
              <th className="py-2.5 px-3">WhatsApp Group</th>
              <th className="py-2.5 px-3">Group ID (@g.us)</th>
              <th className="py-2.5 px-3">Members</th>
              <th className="py-2.5 px-3">Latest Discussion / Voice Note</th>
              <th className="py-2.5 px-3">Staff Response SLA</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {groups.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-ink-muted">
                  No active WhatsApp QR groups detected. Connect a WhatsApp QR channel to start auditing.
                </td>
              </tr>
            ) : (
              groups.map((group) => {
                const isBreach = (group.response_time_minutes || 0) > 15;
                const isWarn = (group.response_time_minutes || 0) > 8 && !isBreach;

                return (
                  <tr key={group.id} className="hover:bg-canvas/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-ink flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                        <MessageSquare className="h-3.5 w-3.5" />
                      </div>
                      <span className="truncate max-w-[180px]">{group.subject}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-ink-muted">
                      {group.id}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 font-mono text-ink-soft">
                        <Users className="h-3 w-3" />
                        {group.participants_count ?? "--"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-ink-soft max-w-xs">
                      <div className="flex items-center gap-1.5">
                        {group.voice_notes_count && group.voice_notes_count > 0 ? (
                          <span className="px-1.5 py-0.5 rounded bg-brand-50 text-brand-600 text-[10px] font-mono flex items-center gap-0.5 shrink-0">
                            <Mic className="h-2.5 w-2.5" /> Voice ({group.voice_notes_count})
                          </span>
                        ) : null}
                        <span className="truncate text-ink">{group.last_message || "No recent messages"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold border ${
                          isBreach
                            ? "bg-danger-50 text-danger-600 border-danger-500/20"
                            : isWarn
                            ? "bg-warn-50 text-warn-600 border-warn-500/20"
                            : "bg-success-50 text-success-600 border-success-500/20"
                        }`}
                      >
                        {group.response_time_minutes ? `${group.response_time_minutes}m SLA` : "Optimal (<2m)"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isBreach ? (
                        <button
                          onClick={() => onSendAlert && onSendAlert(group.id)}
                          className="px-2.5 py-1 rounded-lg bg-danger-50 text-danger-600 hover:bg-danger-100 font-semibold text-[11px] transition-colors border border-danger-500/20"
                        >
                          Alert Rep
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-ink-muted">Monitored</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
