"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  Globe,
  Loader2,
  Mail,
  Phone,
  Save,
  Settings,
  Share2,
} from "lucide-react";
import { useCallback, useState } from "react";

type SettingsGroup = Record<
  string,
  { id: number; key: string; value: string }[]
>;

const GROUP_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  general: { label: "Général", icon: <Globe className="size-4" /> },
  contact: { label: "Contact", icon: <Mail className="size-4" /> },
  social: { label: "Réseaux sociaux", icon: <Share2 className="size-4" /> },
  seo: { label: "SEO", icon: <Settings className="size-4" /> },
};

const KEY_LABELS: Record<string, string> = {
  site_name: "Nom du site",
  site_description: "Description du site",
  contact_email: "Email de contact",
  contact_phone: "Téléphone",
  contact_address: "Adresse",
  instagram_url: "Instagram",
  facebook_url: "Facebook",
  youtube_url: "YouTube",
  tiktok_url: "TikTok",
  ga_measurement_id: "Google Analytics (GA4 ID)",
  gsc_verification: "Google Search Console (verification)",
};

export default function SettingsClient({
  settings,
}: {
  settings: SettingsGroup;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const vals: Record<string, string> = {};
    Object.values(settings).forEach((group) => {
      group.forEach((s) => {
        vals[s.key] = s.value;
      });
    });
    return vals;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: values }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }, [saving, values]);

  const groups = Object.keys(settings);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Settings className="size-6 text-amber-600" />
            Paramètres
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Configuration générale du site
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          {saving ? (
            <Loader2 className="size-4 mr-1 animate-spin" />
          ) : saved ? (
            <Check className="size-4 mr-1" />
          ) : (
            <Save className="size-4 mr-1" />
          )}
          {saved ? "Sauvegardé" : "Sauvegarder"}
        </Button>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-neutral-500">
            <p>Aucun paramètre configuré.</p>
            <p className="text-xs mt-1">
              Les paramètres seront ajoutés au fur et à mesure de
              l&apos;intégration site ↔ dashboard.
            </p>
          </CardContent>
        </Card>
      ) : (
        groups.map((group) => {
          const info = GROUP_LABELS[group] || {
            label: group,
            icon: <Settings className="size-4" />,
          };

          return (
            <Card key={group}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {info.icon}
                  {info.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings[group].map((setting) => {
                  const isTextarea =
                    setting.key.includes("description") ||
                    setting.key.includes("address");

                  return (
                    <div key={setting.key} className="space-y-2">
                      <Label className="text-xs text-neutral-500">
                        {KEY_LABELS[setting.key] || setting.key}
                      </Label>
                      {isTextarea ? (
                        <Textarea
                          value={values[setting.key] || ""}
                          onChange={(e) =>
                            setValues((prev) => ({
                              ...prev,
                              [setting.key]: e.target.value,
                            }))
                          }
                          rows={3}
                          className="text-sm resize-none"
                        />
                      ) : (
                        <Input
                          value={values[setting.key] || ""}
                          onChange={(e) =>
                            setValues((prev) => ({
                              ...prev,
                              [setting.key]: e.target.value,
                            }))
                          }
                          className="text-sm"
                        />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
