"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Check,
  Globe,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Star,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { PricingPlan, PricingContent, PricingFeature } from "@prisma/client";

type PlanWithRelations = PricingPlan & {
  contents: PricingContent[];
  features: PricingFeature[];
};

interface LangData {
  name: string;
  subtitle: string;
  description: string;
}

interface FeatureItem {
  id?: number;
  text: string;
  included: boolean;
  position: number;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function PlanEditorClient({
  plan,
}: {
  plan: PlanWithRelations | null;
}) {
  const router = useRouter();
  const isNew = !plan;

  // Plan-level fields
  const [slug, setSlug] = useState(plan?.slug || "");
  const [price, setPrice] = useState(plan?.price || "");
  const [status, setStatus] = useState<string>(plan?.status || "DRAFT");
  const [isPopular, setIsPopular] = useState(plan?.isPopular || false);

  // Language data
  const [activeLang, setActiveLang] = useState<"fr" | "en">("fr");
  const [langData, setLangData] = useState<Record<"fr" | "en", LangData>>({
    fr: {
      name: plan?.contents.find((c) => c.language === "fr")?.name || "",
      subtitle: plan?.contents.find((c) => c.language === "fr")?.subtitle || "",
      description: plan?.contents.find((c) => c.language === "fr")?.description || "",
    },
    en: {
      name: plan?.contents.find((c) => c.language === "en")?.name || "",
      subtitle: plan?.contents.find((c) => c.language === "en")?.subtitle || "",
      description: plan?.contents.find((c) => c.language === "en")?.description || "",
    },
  });

  // Features per language
  const [features, setFeatures] = useState<Record<"fr" | "en", FeatureItem[]>>({
    fr: plan?.features
      .filter((f) => f.language === "fr")
      .map((f) => ({
        id: f.id,
        text: f.text,
        included: f.included,
        position: f.position,
      })) || [],
    en: plan?.features
      .filter((f) => f.language === "en")
      .map((f) => ({
        id: f.id,
        text: f.text,
        included: f.included,
        position: f.position,
      })) || [],
  });

  // UI state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!plan?.slug);

  const updateLangField = (
    lang: "fr" | "en",
    field: keyof LangData,
    value: string
  ) => {
    setLangData((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }));
    setSaved(false);
  };

  // Auto-slug from FR name
  const handleNameChange = (lang: "fr" | "en", value: string) => {
    updateLangField(lang, "name", value);
    if (lang === "fr" && !slugManuallyEdited) {
      setSlug(generateSlug(value));
    }
  };

  // Feature management
  const addFeature = (lang: "fr" | "en") => {
    setFeatures((prev) => ({
      ...prev,
      [lang]: [
        ...prev[lang],
        {
          text: "",
          included: true,
          position: prev[lang].length,
        },
      ],
    }));
  };

  const updateFeature = (
    lang: "fr" | "en",
    index: number,
    field: keyof FeatureItem,
    value: string | boolean
  ) => {
    setFeatures((prev) => ({
      ...prev,
      [lang]: prev[lang].map((f, i) =>
        i === index ? { ...f, [field]: value } : f
      ),
    }));
  };

  const removeFeature = (lang: "fr" | "en", index: number) => {
    setFeatures((prev) => ({
      ...prev,
      [lang]: prev[lang]
        .filter((_, i) => i !== index)
        .map((f, i) => ({ ...f, position: i })),
    }));
  };

  // Drag reorder features
  const [draggedFeatureIndex, setDraggedFeatureIndex] = useState<number | null>(null);

  const handleFeatureDragStart = (index: number) => {
    setDraggedFeatureIndex(index);
  };

  const handleFeatureDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedFeatureIndex === null || draggedFeatureIndex === index) return;

    setFeatures((prev) => {
      const items = [...prev[activeLang]];
      const dragged = items[draggedFeatureIndex];
      items.splice(draggedFeatureIndex, 1);
      items.splice(index, 0, dragged);
      return {
        ...prev,
        [activeLang]: items.map((f, i) => ({ ...f, position: i })),
      };
    });
    setDraggedFeatureIndex(index);
  };

  const handleFeatureDragEnd = () => {
    setDraggedFeatureIndex(null);
  };

  // Save
  const handleSave = useCallback(
    async (showFeedback = true) => {
      if (saving) return;
      setSaving(true);

      try {
        const payload = {
          slug,
          price,
          status,
          isPopular,
          contents: {
            fr: langData.fr,
            en: langData.en,
          },
          features: {
            fr: features.fr,
            en: features.en,
          },
        };

        const url = isNew ? "/api/tarifs" : `/api/tarifs/${plan.id}`;
        const method = isNew ? "POST" : "PUT";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Erreur de sauvegarde");

        const data = await res.json();

        if (showFeedback) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }

        if (isNew) {
          router.push(`/tarifs/${data.id}`);
        }
      } catch (err) {
        console.error("Save error:", err);
      } finally {
        setSaving(false);
      }
    },
    [saving, slug, price, status, isPopular, langData, features, isNew, plan?.id, router]
  );

  const handlePublish = async () => {
    setStatus("PUBLISHED");
    setTimeout(() => handleSave(true), 50);
  };

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/tarifs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="size-4 mr-1" />
              Tarifs
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-neutral-900">
            {isNew ? "Nouvelle formule" : langData.fr.name || "Sans nom"}
          </h1>
          {isPopular && (
            <Badge className="bg-amber-100 text-amber-700">
              <Star className="size-3 mr-1 fill-amber-500" />
              Populaire
            </Badge>
          )}
          <Badge
            className={
              status === "PUBLISHED"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }
          >
            {status === "PUBLISHED" ? "Publié" : "Brouillon"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="size-4 mr-1 animate-spin" />
            ) : saved ? (
              <Check className="size-4 mr-1 text-emerald-600" />
            ) : (
              <Save className="size-4 mr-1" />
            )}
            {saved ? "Sauvegardé" : "Sauvegarder"}
          </Button>
          {status !== "PUBLISHED" && (
            <Button
              size="sm"
              onClick={handlePublish}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Globe className="size-4 mr-1" />
              Publier
            </Button>
          )}
        </div>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main column */}
        <div className="space-y-6">
          <Tabs
            value={activeLang}
            onValueChange={(v) => setActiveLang(v as "fr" | "en")}
          >
            <TabsList>
              <TabsTrigger value="fr" className="gap-1.5">
                🇫🇷 Français
              </TabsTrigger>
              <TabsTrigger value="en" className="gap-1.5">
                🇬🇧 English
              </TabsTrigger>
            </TabsList>

            {(["fr", "en"] as const).map((lang) => (
              <TabsContent key={lang} value={lang} className="space-y-6 mt-4">
                {/* Name & subtitle */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      {lang === "fr" ? "Informations" : "Information"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-neutral-500">
                        {lang === "fr" ? "Nom de la formule" : "Plan name"}
                      </Label>
                      <Input
                        value={langData[lang].name}
                        onChange={(e) =>
                          handleNameChange(lang, e.target.value)
                        }
                        placeholder={
                          lang === "fr" ? "Essentiel" : "Essential"
                        }
                        className="text-lg font-semibold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-neutral-500">
                        {lang === "fr" ? "Sous-titre" : "Subtitle"}
                      </Label>
                      <Input
                        value={langData[lang].subtitle}
                        onChange={(e) =>
                          updateLangField(lang, "subtitle", e.target.value)
                        }
                        placeholder={
                          lang === "fr"
                            ? "Pour les mariages intimes"
                            : "For intimate weddings"
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-neutral-500">
                        Description
                      </Label>
                      <Textarea
                        value={langData[lang].description}
                        onChange={(e) =>
                          updateLangField(lang, "description", e.target.value)
                        }
                        placeholder={
                          lang === "fr"
                            ? "Description de la formule..."
                            : "Plan description..."
                        }
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Features list */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        Features ({features[lang].length})
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addFeature(lang)}
                      >
                        <Plus className="size-3.5 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {features[lang].length === 0 ? (
                      <p className="text-sm text-neutral-400 text-center py-4">
                        Aucune feature
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {features[lang].map((feature, index) => (
                          <div
                            key={index}
                            draggable
                            onDragStart={() => handleFeatureDragStart(index)}
                            onDragOver={(e) => handleFeatureDragOver(e, index)}
                            onDragEnd={handleFeatureDragEnd}
                            className={`flex items-center gap-2 p-2 rounded-md border transition-colors ${
                              draggedFeatureIndex === index
                                ? "border-amber-300 bg-amber-50 opacity-50"
                                : "border-neutral-200 hover:border-neutral-300"
                            }`}
                          >
                            <GripVertical className="size-4 text-neutral-300 cursor-grab active:cursor-grabbing shrink-0" />
                            <Checkbox
                              checked={feature.included}
                              onCheckedChange={(checked) =>
                                updateFeature(
                                  lang,
                                  index,
                                  "included",
                                  checked === true
                                )
                              }
                            />
                            <Input
                              value={feature.text}
                              onChange={(e) =>
                                updateFeature(
                                  lang,
                                  index,
                                  "text",
                                  e.target.value
                                )
                              }
                              placeholder={
                                lang === "fr"
                                  ? "Texte de la feature..."
                                  : "Feature text..."
                              }
                              className="flex-1 h-8 text-sm"
                            />
                            <button
                              onClick={() => removeFeature(lang, index)}
                              className="p-1 text-neutral-400 hover:text-red-500 transition-colors shrink-0"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Statut</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">
                  {status === "PUBLISHED" ? "Publié" : "Brouillon"}
                </span>
                <Switch
                  checked={status === "PUBLISHED"}
                  onCheckedChange={(checked) =>
                    setStatus(checked ? "PUBLISHED" : "DRAFT")
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 flex items-center gap-1.5">
                  <Star className="size-3.5 text-amber-500" />
                  Populaire
                </span>
                <Switch
                  checked={isPopular}
                  onCheckedChange={setIsPopular}
                />
              </div>
            </CardContent>
          </Card>

          {/* Price */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Prix</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2 500€"
                className="text-lg font-bold"
              />
              <p className="text-xs text-neutral-400 mt-1.5">
                Format libre : &quot;2 500€&quot;, &quot;À partir de 1 800€&quot;, etc.
              </p>
            </CardContent>
          </Card>

          {/* Slug */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Slug URL</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugManuallyEdited(true);
                }}
                placeholder="formule-essentiel"
                className="text-sm"
              />
            </CardContent>
          </Card>

          {/* Preview card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Prévisualisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-neutral-200 p-4 bg-white text-center">
                {isPopular && (
                  <Badge className="bg-amber-100 text-amber-700 mb-2">
                    Populaire
                  </Badge>
                )}
                <h3 className="font-bold text-lg">
                  {langData[activeLang].name || "Nom"}
                </h3>
                {langData[activeLang].subtitle && (
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {langData[activeLang].subtitle}
                  </p>
                )}
                <p className="text-2xl font-bold text-amber-600 mt-2">
                  {price || "—"}
                </p>
                {features[activeLang].length > 0 && (
                  <ul className="mt-3 space-y-1 text-left text-sm">
                    {features[activeLang].slice(0, 5).map((f, i) => (
                      <li
                        key={i}
                        className={`flex items-center gap-2 ${
                          f.included ? "text-neutral-700" : "text-neutral-400 line-through"
                        }`}
                      >
                        <span
                          className={`text-xs ${
                            f.included ? "text-emerald-500" : "text-neutral-300"
                          }`}
                        >
                          {f.included ? "✓" : "✗"}
                        </span>
                        {f.text || "..."}
                      </li>
                    ))}
                    {features[activeLang].length > 5 && (
                      <li className="text-xs text-neutral-400">
                        +{features[activeLang].length - 5} autres
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
