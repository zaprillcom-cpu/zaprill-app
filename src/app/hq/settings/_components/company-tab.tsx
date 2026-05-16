"use client";

import { Building2, CheckCircle2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CompanySettings } from "@/lib/app-settings";

interface CompanyTabProps {
  initialSettings: CompanySettings;
  onMutate: (action: string, data: Record<string, any>) => Promise<any>;
}

const EMPTY: CompanySettings = {
  company_name: "",
  company_gstin: "",
  company_address: "",
  company_cin: "",
  company_email: "",
};

export function CompanyTab({ initialSettings, onMutate }: CompanyTabProps) {
  const [form, setForm] = useState<CompanySettings>(initialSettings ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initialSettings) setForm(initialSettings);
  }, [initialSettings]);

  const handleChange = (key: keyof CompanySettings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await onMutate("update_company_settings", form);
      setSaved(true);
      toast.success("Company settings saved.");
    } catch (e: any) {
      toast.error(e.message || "Failed to save company settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Company Details</CardTitle>
          </div>
          <CardDescription>
            These details appear on all customer invoices and PDF receipts.
            Leave GSTIN, Address, and CIN blank until your company is formally
            registered.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Company Name */}
          <div className="space-y-1.5">
            <Label htmlFor="company_name">Company / Brand Name</Label>
            <Input
              id="company_name"
              value={form.company_name}
              onChange={(e) => handleChange("company_name", e.target.value)}
              placeholder="Zaprill"
            />
          </div>

          {/* Billing Email */}
          <div className="space-y-1.5">
            <Label htmlFor="company_email">Billing Email</Label>
            <Input
              id="company_email"
              type="email"
              value={form.company_email}
              onChange={(e) => handleChange("company_email", e.target.value)}
              placeholder="billing@zaprill.com"
            />
            <p className="text-muted-foreground text-xs">
              Shown in invoice footers and as the reply-to address for receipts.
            </p>
          </div>

          {/* Registered Address */}
          <div className="space-y-1.5">
            <Label htmlFor="company_address">
              Registered Address{" "}
              <span className="font-normal text-muted-foreground">
                (leave blank if unregistered)
              </span>
            </Label>
            <Textarea
              id="company_address"
              value={form.company_address}
              onChange={(e) => handleChange("company_address", e.target.value)}
              placeholder="123 Business Park, Mumbai, Maharashtra 400001"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* GSTIN */}
            <div className="space-y-1.5">
              <Label htmlFor="company_gstin">
                GSTIN{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id="company_gstin"
                value={form.company_gstin}
                onChange={(e) => handleChange("company_gstin", e.target.value)}
                placeholder="27AAAAA0000A1Z5"
                className="font-mono uppercase"
                maxLength={15}
              />
            </div>

            {/* CIN */}
            <div className="space-y-1.5">
              <Label htmlFor="company_cin">
                CIN{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id="company_cin"
                value={form.company_cin}
                onChange={(e) => handleChange("company_cin", e.target.value)}
                placeholder="U74999MH2024PTC123456"
                className="font-mono uppercase"
                maxLength={21}
              />
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving} className="min-w-28">
              {saving ? (
                "Saving…"
              ) : saved ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-400" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            {saved && (
              <p className="font-medium text-emerald-600 text-sm">
                Invoice details updated successfully.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info callout */}
      <Card className="border-dashed bg-muted/30">
        <CardContent className="py-4">
          <p className="text-muted-foreground text-sm">
            <strong className="text-foreground">📌 Note:</strong> Fields left
            blank will simply be omitted from invoices — no placeholder values
            will be shown to customers. Add GSTIN and CIN once your company is
            registered to ensure GST-compliant receipts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
