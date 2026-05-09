"use client";

/**
 * ReferralsTab — Admin HQ Settings: Referrals
 *
 * Features:
 *  - Summary KPI cards (total, converted, conversion rate, pending commissions)
 *  - Referral settings (enable/disable, reward %, expiry days)
 *  - Referrals table with status filters
 *  - Influencer code creation form (flat / per_user / percentage commission)
 *  - Commission management (mark paid, void)
 *  - Fraud flagging
 */

import {
  Award,
  CheckCircle,
  ChevronDown,
  Clock,
  Flag,
  Loader2,
  Plus,
  RefreshCw,
  Settings,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// ─────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────

interface AdminSummary {
  total: number;
  converted: number;
  pending: number;
  expired: number;
  fraudulent: number;
  conversionRate: number;
  pendingCommissions: number;
}

interface ReferralSettings {
  referral_enabled: boolean;
  referral_referrer_reward_pct: number;
  referral_referee_reward_pct: number;
  referral_expiry_days: number;
  referral_max_per_user: number | null;
}

interface ReferralRow {
  referral: {
    id: string;
    referrerUserId: string;
    referredUserId: string | null;
    referralCode: string;
    type: string;
    status: string;
    referredEmail: string | null;
    convertedAt: string | null;
    createdAt: string;
  };
  referrerName: string | null;
  referrerEmail: string | null;
}

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    signed_up: { label: "Pending", cls: "badge badge--warning" },
    converted: { label: "Converted", cls: "badge badge--success" },
    expired: { label: "Expired", cls: "badge badge--muted" },
    fraudulent: { label: "Fraud", cls: "badge badge--danger" },
  };
  const { label, cls } = map[status] ?? {
    label: status,
    cls: "badge badge--muted",
  };
  return <span className={cls}>{label}</span>;
}

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────

function SummaryCards({ summary }: { summary: AdminSummary }) {
  return (
    <div className="referrals-kpi-grid">
      <div className="referrals-kpi">
        <Users size={16} className="referrals-kpi__icon" />
        <div className="referrals-kpi__value">{summary.total}</div>
        <div className="referrals-kpi__label">Total Referrals</div>
      </div>
      <div className="referrals-kpi referrals-kpi--success">
        <CheckCircle size={16} className="referrals-kpi__icon" />
        <div className="referrals-kpi__value">{summary.converted}</div>
        <div className="referrals-kpi__label">Converted</div>
      </div>
      <div className="referrals-kpi">
        <TrendingUp size={16} className="referrals-kpi__icon" />
        <div className="referrals-kpi__value">{summary.conversionRate}%</div>
        <div className="referrals-kpi__label">Conversion Rate</div>
      </div>
      <div className="referrals-kpi">
        <Clock size={16} className="referrals-kpi__icon" />
        <div className="referrals-kpi__value">{summary.pending}</div>
        <div className="referrals-kpi__label">Pending</div>
      </div>
      <div className="referrals-kpi referrals-kpi--warning">
        <Wallet size={16} className="referrals-kpi__icon" />
        <div className="referrals-kpi__value">{summary.pendingCommissions}</div>
        <div className="referrals-kpi__label">Pending Commissions</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────

export function ReferralsTab() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  // Settings form state
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState<ReferralSettings | null>(
    null,
  );

  // Influencer form
  const [showInfluencerForm, setShowInfluencerForm] = useState(false);
  const [influencerForm, setInfluencerForm] = useState({
    userId: "",
    commissionType: "flat" as "flat" | "per_user" | "percentage",
    commissionValue: "",
    customCode: "",
    refereePct: "",
  });
  const [submittingInfluencer, setSubmittingInfluencer] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter) params.set("type", typeFilter);

      const res = await fetch(`/api/admin/referrals?${params}`);
      if (!res.ok) throw new Error("Failed to load referrals");
      const json = await res.json();
      setSummary(json.summary);
      setSettings(json.settings);
      setSettingsForm(json.settings);
      setReferrals(json.referrals ?? []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Settings save
  async function saveSettings() {
    if (!settingsForm) return;
    setSavingSettings(true);
    try {
      const keys = [
        {
          key: "referral_enabled",
          value: String(settingsForm.referral_enabled),
        },
        {
          key: "referral_referrer_reward_pct",
          value: String(settingsForm.referral_referrer_reward_pct),
        },
        {
          key: "referral_referee_reward_pct",
          value: String(settingsForm.referral_referee_reward_pct),
        },
        {
          key: "referral_expiry_days",
          value: String(settingsForm.referral_expiry_days),
        },
        {
          key: "referral_max_per_user",
          value:
            settingsForm.referral_max_per_user != null
              ? String(settingsForm.referral_max_per_user)
              : "",
        },
      ];

      // Persist each key via admin settings endpoint
      for (const { key, value } of keys) {
        await fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _action: "update_setting", key, value }),
        });
      }

      setSettings(settingsForm);
      toast.success("Referral settings saved");
    } catch (e: any) {
      toast.error(e.message || "Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  }

  // ── Influencer code creation
  async function createInfluencerCode() {
    const { userId, commissionType, commissionValue, customCode, refereePct } =
      influencerForm;
    if (!userId || !commissionValue) {
      toast.error("User ID and commission value are required");
      return;
    }
    setSubmittingInfluencer(true);
    try {
      const res = await fetch("/api/admin/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _action: "create_influencer_code",
          userId,
          commissionType,
          commissionValue: parseFloat(commissionValue),
          customCode: customCode || undefined,
          refereePct: refereePct ? parseFloat(refereePct) : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      toast.success(`Influencer code created: ${json.code}`);
      setShowInfluencerForm(false);
      setInfluencerForm({
        userId: "",
        commissionType: "flat",
        commissionValue: "",
        customCode: "",
        refereePct: "",
      });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmittingInfluencer(false);
    }
  }

  // ── Flag fraud
  async function flagFraud(referralId: string) {
    if (!confirm("Flag this referral as fraudulent? This cannot be undone."))
      return;
    await fetch("/api/admin/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _action: "flag_fraudulent", referralId }),
    });
    toast.success("Flagged as fraudulent");
    fetchData();
  }

  return (
    <div className="referrals-tab">
      {/* Summary */}
      {summary && <SummaryCards summary={summary} />}

      {/* Settings Panel */}
      <div className="referrals-settings-card">
        <div className="referrals-settings-card__header">
          <Settings size={16} />
          <span>Referral Program Settings</span>
        </div>
        {settingsForm && (
          <div className="referrals-settings-grid">
            <label className="referrals-settings-toggle">
              <span>Program Enabled</span>
              <input
                type="checkbox"
                checked={settingsForm.referral_enabled}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    referral_enabled: e.target.checked,
                  })
                }
              />
            </label>

            <div className="referrals-settings-field">
              <label>Referrer Reward %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={settingsForm.referral_referrer_reward_pct}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    referral_referrer_reward_pct: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <div className="referrals-settings-field">
              <label>Referee Reward %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={settingsForm.referral_referee_reward_pct}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    referral_referee_reward_pct: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <div className="referrals-settings-field">
              <label>Referral Expiry Days</label>
              <input
                type="number"
                min={1}
                value={settingsForm.referral_expiry_days}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    referral_expiry_days: parseInt(e.target.value, 10),
                  })
                }
              />
            </div>

            <div className="referrals-settings-field">
              <label>Max Referrals / User (blank = unlimited)</label>
              <input
                type="number"
                min={1}
                value={settingsForm.referral_max_per_user ?? ""}
                placeholder="Unlimited"
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    referral_max_per_user: e.target.value
                      ? parseInt(e.target.value, 10)
                      : null,
                  })
                }
              />
            </div>

            <button
              className="hq-btn hq-btn--primary"
              onClick={saveSettings}
              disabled={savingSettings}
            >
              {savingSettings ? <Loader2 size={14} className="spin" /> : null}
              Save Settings
            </button>
          </div>
        )}
      </div>

      {/* Influencer Code Creator */}
      <div className="referrals-section">
        <div className="referrals-section__header">
          <div className="referrals-section__title">
            <Award size={15} /> Influencer Codes
          </div>
          <button
            className="hq-btn hq-btn--ghost hq-btn--sm"
            onClick={() => setShowInfluencerForm((v) => !v)}
          >
            <Plus size={14} /> New Influencer Code
          </button>
        </div>

        {showInfluencerForm && (
          <div className="influencer-form">
            <div className="influencer-form__grid">
              <div className="influencer-form__field">
                <label>User ID</label>
                <input
                  type="text"
                  placeholder="user_xxxxxxxxxx"
                  value={influencerForm.userId}
                  onChange={(e) =>
                    setInfluencerForm({
                      ...influencerForm,
                      userId: e.target.value,
                    })
                  }
                />
              </div>
              <div className="influencer-form__field">
                <label>Custom Code (optional)</label>
                <input
                  type="text"
                  placeholder="TECHGURU"
                  value={influencerForm.customCode}
                  onChange={(e) =>
                    setInfluencerForm({
                      ...influencerForm,
                      customCode: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
              <div className="influencer-form__field">
                <label>Commission Type</label>
                <select
                  value={influencerForm.commissionType}
                  onChange={(e) =>
                    setInfluencerForm({
                      ...influencerForm,
                      commissionType: e.target.value as
                        | "flat"
                        | "per_user"
                        | "percentage",
                    })
                  }
                >
                  <option value="flat">Flat (₹ total payout)</option>
                  <option value="per_user">
                    Per User (₹ per converted user)
                  </option>
                  <option value="percentage">Percentage (% of revenue)</option>
                </select>
              </div>
              <div className="influencer-form__field">
                <label>
                  Commission Value{" "}
                  {influencerForm.commissionType === "percentage"
                    ? "(%)"
                    : "(₹)"}
                </label>
                <input
                  type="number"
                  min={0}
                  placeholder={
                    influencerForm.commissionType === "percentage"
                      ? "15"
                      : "500"
                  }
                  value={influencerForm.commissionValue}
                  onChange={(e) =>
                    setInfluencerForm({
                      ...influencerForm,
                      commissionValue: e.target.value,
                    })
                  }
                />
              </div>
              <div className="influencer-form__field">
                <label>Override Referee Discount % (optional)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Default from settings"
                  value={influencerForm.refereePct}
                  onChange={(e) =>
                    setInfluencerForm({
                      ...influencerForm,
                      refereePct: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="influencer-form__actions">
              <button
                className="hq-btn hq-btn--primary"
                onClick={createInfluencerCode}
                disabled={submittingInfluencer}
              >
                {submittingInfluencer ? (
                  <Loader2 size={14} className="spin" />
                ) : (
                  <Plus size={14} />
                )}
                Create Code
              </button>
              <button
                className="hq-btn hq-btn--ghost"
                onClick={() => setShowInfluencerForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Referrals Table */}
      <div className="referrals-section">
        <div className="referrals-section__header">
          <div className="referrals-section__title">
            <Users size={15} /> All Referrals
          </div>
          <div className="referrals-filters">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="referrals-filter-select"
            >
              <option value="">All Statuses</option>
              <option value="signed_up">Pending</option>
              <option value="converted">Converted</option>
              <option value="expired">Expired</option>
              <option value="fraudulent">Fraudulent</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="referrals-filter-select"
            >
              <option value="">All Types</option>
              <option value="user">User</option>
              <option value="influencer">Influencer</option>
            </select>
            <button
              className="hq-btn hq-btn--ghost hq-btn--icon"
              onClick={fetchData}
              title="Refresh"
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="referrals-loading">
            <Loader2 size={20} className="spin" />
          </div>
        ) : referrals.length === 0 ? (
          <div className="referrals-empty">No referrals found.</div>
        ) : (
          <div className="referrals-table-wrap">
            <table className="referrals-table">
              <thead>
                <tr>
                  <th>Referrer</th>
                  <th>Code</th>
                  <th>Referred Email</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Converted At</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map(({ referral, referrerName, referrerEmail }) => (
                  <tr key={referral.id}>
                    <td>
                      <div className="referrals-table__name">
                        {referrerName ?? "—"}
                      </div>
                      <div className="referrals-table__email">
                        {referrerEmail ?? "—"}
                      </div>
                    </td>
                    <td>
                      <code className="referrals-table__code">
                        {referral.referralCode}
                      </code>
                    </td>
                    <td>{referral.referredEmail ?? "—"}</td>
                    <td>
                      <span className="badge badge--info">{referral.type}</span>
                    </td>
                    <td>
                      <StatusBadge status={referral.status} />
                    </td>
                    <td>{fmt(referral.convertedAt)}</td>
                    <td>{fmt(referral.createdAt)}</td>
                    <td>
                      {referral.status !== "fraudulent" && (
                        <button
                          className="hq-btn hq-btn--danger hq-btn--sm"
                          onClick={() => flagFraud(referral.id)}
                          title="Flag as fraudulent"
                        >
                          <Flag size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
