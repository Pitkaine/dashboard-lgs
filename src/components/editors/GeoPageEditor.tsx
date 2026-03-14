"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { GeoPageBody } from "./page-types";

interface Props {
  body: Record<string, unknown> | null;
  onChange: (body: Record<string, unknown>) => void;
  lang: "fr" | "en";
}

export default function GeoPageEditor({ body, onChange, lang }: Props) {
  const data = (body || {}) as Partial<GeoPageBody>;
  const isFr = lang === "fr";

  const update = (field: string, value: string) => {
    onChange({ ...body, [field]: value });
  };

  const updateSection = (index: number, field: string, value: string) => {
    const sections = [...(data.sections || [])];
    sections[index] = { ...(sections[index] || { title: "", text: "" }), [field]: value };
    onChange({ ...body, sections });
  };

  const sections = data.sections && data.sections.length > 0
    ? data.sections
    : Array.from({ length: 5 }, () => ({ title: "", text: "" }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {isFr ? "Section Hero" : "Hero Section"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Titre principal (H1)" : "Main Title (H1)"}
            </Label>
            <Input
              value={data.heroTitle || ""}
              onChange={(e) => update("heroTitle", e.target.value)}
              placeholder={isFr ? "Titre hero..." : "Hero title..."}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Sous-titre" : "Subtitle"}
            </Label>
            <Input
              value={data.heroSubtitle || ""}
              onChange={(e) => update("heroSubtitle", e.target.value)}
              placeholder={isFr ? "Sous-titre hero..." : "Hero subtitle..."}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Introduction</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.intro || ""}
            onChange={(e) => update("intro", e.target.value)}
            placeholder={isFr ? "Texte d'introduction..." : "Introduction text..."}
            rows={4}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {sections.map((section, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Section {i + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-neutral-500">
                {isFr ? "Titre de la section" : "Section Title"}
              </Label>
              <Input
                value={section.title || ""}
                onChange={(e) => updateSection(i, "title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-neutral-500">
                {isFr ? "Contenu" : "Content"}
              </Label>
              <Textarea
                value={section.text || ""}
                onChange={(e) => updateSection(i, "text", e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {isFr ? "Appel \u00e0 l'action (CTA)" : "Call to Action (CTA)"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Titre CTA" : "CTA Title"}
            </Label>
            <Input
              value={data.ctaTitle || ""}
              onChange={(e) => update("ctaTitle", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Texte CTA" : "CTA Text"}
            </Label>
            <Input
              value={data.ctaText || ""}
              onChange={(e) => update("ctaText", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Bouton CTA" : "CTA Button"}
            </Label>
            <Input
              value={data.ctaButton || ""}
              onChange={(e) => update("ctaButton", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
