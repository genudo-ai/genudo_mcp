import React, { useState } from "react";
import { KeyRound, ShieldCheck, ArrowRight, ExternalLink } from "lucide-react";
import { callGenudoMcp } from "../lib/genudoMcp";

interface TokenModalProps {
  onSuccess: (token: string) => void;
}

export const TokenModal: React.FC<TokenModalProps> = ({ onSuccess }) => {
  const [tokenInput, setTokenInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setError("Please paste your GenuDo Full Access Token");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await callGenudoMcp("get_account_summary", {}, tokenInput.trim());
      localStorage.setItem("genudo_token", tokenInput.trim());
      onSuccess(tokenInput.trim());
    } catch (err: any) {
      setError(err.message || "Failed to authenticate token with GenuDo MCP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-lift">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 mb-5">
          <KeyRound className="h-6 w-6" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-ink mb-1.5 font-sans">
          Connect GenuDo Account
        </h2>
        <p className="text-xs text-ink-soft mb-5">
          Enter your Personal Full Access Token to load real-time operational metrics from your AI pipelines.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-1.5">
              Full Access Token
            </label>
            <input
              type="password"
              placeholder="Paste token starting with genudo_pat_..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full rounded-xl border border-line bg-canvas px-4 py-3 text-xs text-ink placeholder-ink-muted focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400 font-mono"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-danger-50 border border-danger-500/20 p-3 text-xs text-danger-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 px-5 py-3 text-xs font-semibold text-surface transition duration-150 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Verifying Connection...</span>
            ) : (
              <>
                <span>Launch Live Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5 text-ink-soft">
            <ShieldCheck className="h-4 w-4 text-success-600" />
            Saved securely in localStorage
          </span>
          <a
            href="https://api.genudo.ai/docs/guide/authentication"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-brand-600 hover:text-brand-700 font-medium"
          >
            Get Token <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
