"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { DestinationWeddingPageBody } from "./page-types";

interface Props {
  body: Record<string, unknown> | null;
  onChange: (body: Record<string, unknown>) => void;
  lang: "fr" | "en";
}

export default function DestinationWeddingPageEditor({ body, onChange, lang }: Props) {
  const data = (body || {}) as Partial<DestinationWeddingPageBody>;
  const isFr = lang === "fr";

  const update = (field: string, value: unknown) => {
    onChange({ ...body, [field]: value });
  };

  // ── Location helpers ──
  const locations = data.locations && data.locations.length > 0
    ? data.locations
    : Array.from({ length: 6 }, () => ({ name: "", desc: "" }));

  const updateLocation = (index: number, field: "name" | "desc", value: string) => {
    const updated = [...locations];
    updated[index] = { ...updated[index], [field]: value };
    update("locations", updated);
  };

  const addLocation = () => {
    update("locations", [...locations, { name: "", desc: "" }]);
  };

  const removeLocation = (index: number) => {
    update("locations", locations.filter((_, i) => i !== index));
  };

  // ── Services helpers ──
  const services = data.services && data.services.length > 0
    ? data.services
    : Array.from({ length: 7 }, () => "");

  const updateService = (index: number, value: string) => {
    const updated = [...services];
    updated[index] = value;
    update("services", updated);
  };

  const addService = () => {
    update("services", [...services, ""]);
  };

  const removeService = (index: number) => {
    update("services", services.filter((_, i) => i !== index));
  };

  // ── Tips helpers ──
  const tips = data.tips && data.tips.length > 0
    ? data.tips
    : Array.from({ length: 5 }, () => ({ title: "", text: "" }));

  const updateTip = (index: number, field: "title" | "text", value: string) => {
    const updated = [...tips];
    updated[index] = { ...updated[index], [field]: value };
    update("tips", updated);
  };

  const addTip = () => {
    update("tips", [...tips, { title: "", text: "" }]);
  };

  const removeTip = (index: number) => {
    update("tips", tips.filter((_, i) => i !== index));
  };

  // ── FAQ helpers ──
  const faqItems = data.faqItems && data.faqItems.length > 0
    ? data.faqItems
    : Array.from({ length: 6 }, () => ({ question: "", answer: "" }));

  const updateFaq = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...faqItems];
    updated[index] = { ...updated[index], [field]: value };
    update("faqItems", updated);
  };

  const addFaq = () => {
    update("faqItems", [...faqItems, { question: "", answer: "" }]);
  };

  const removeFaq = (index: number) => {
    update("faqItems", faqItems.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
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

      {/* Intro */}
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

      {/* Section 1 — Why France */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {isFr ? "Section 1 — Pourquoi la France" : "Section 1 — Why France"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Titre" : "Title"}
            </Label>
            <Input
              value={data.section1Title || ""}
              onChange={(e) => update("section1Title", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Contenu" : "Content"}
            </Label>
            <Textarea
              value={data.section1Text || ""}
              onChange={(e) => update("section1Text", e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 2 — Locations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {isFr ? "Section 2 — Destinations" : "Section 2 — Locations"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Titre" : "Title"}
            </Label>
            <Input
              value={data.section2Title || ""}
              onChange={(e) => update("section2Title", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Introduction" : "Introduction"}
            </Label>
            <Textarea
              value={data.section2Intro || ""}
              onChange={(e) => update("section2Intro", e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-3">
            <Label className="text-xs text-neutral-500 font-medium">
              {isFr ? "Destinations" : "Locations"}
            </Label>
            {locations.map((loc, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <Input
                    value={loc.name}
                    onChange={(e) => updateLocation(i, "name", e.target.value)}
                    placeholder={isFr ? `Nom destination ${i + 1}` : `Location ${i + 1} name`}
                    className="text-sm"
                  />
                  <Textarea
                    value={loc.desc}
                    onChange={(e) => updateLocation(i, "desc", e.target.value)}
                    placeholder={isFr ? "Description..." : "Description..."}
                    rows={2}
                    className="resize-none text-sm"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 mt-1"
                  onClick={() => removeLocation(i)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addLocation}>
              <Plus className="size-4 mr-1" />
              {isFr ? "Ajouter une destination" : "Add location"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 3 — Why us */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {isFr ? "Section 3 — Pourquoi nous" : "Section 3 — Why Us"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Titre" : "Title"}
            </Label>
            <Input
              value={data.section3Title || ""}
              onChange={(e) => update("section3Title", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Contenu" : "Content"}
            </Label>
            <Textarea
              value={data.section3Text || ""}
              onChange={(e) => update("section3Text", e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 4 — Services */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {isFr ? "Section 4 — Services" : "Section 4 — Services"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Titre" : "Title"}
            </Label>
            <Input
              value={data.section4Title || ""}
              onChange={(e) => update("section4Title", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Introduction" : "Introduction"}
            </Label>
            <Textarea
              value={data.section4Intro || ""}
              onChange={(e) => update("section4Intro", e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500 font-medium">
              {isFr ? "Liste des services" : "Services List"}
            </Label>
            {services.map((s, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={s}
                  onChange={(e) => updateService(i, e.target.value)}
                  placeholder={isFr ? `Service ${i + 1}` : `Service ${i + 1}`}
                  className="flex-1 text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => removeService(i)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addService}>
              <Plus className="size-4 mr-1" />
              {isFr ? "Ajouter un service" : "Add service"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 5 — How we work */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {isFr ? "Section 5 — Comment on travaille" : "Section 5 — How We Work"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Titre" : "Title"}
            </Label>
            <Input
              value={data.section5Title || ""}
              onChange={(e) => update("section5Title", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Contenu" : "Content"}
            </Label>
            <Textarea
              value={data.section5Text || ""}
              onChange={(e) => update("section5Text", e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 6 — Tips */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {isFr ? "Section 6 — Conseils" : "Section 6 — Tips"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Titre de la section" : "Section Title"}
            </Label>
            <Input
              value={data.section6Title || ""}
              onChange={(e) => update("section6Title", e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <Label className="text-xs text-neutral-500 font-medium">
              {isFr ? "Conseils" : "Tips"}
            </Label>
            {tips.map((tip, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <Input
                    value={tip.title}
                    onChange={(e) => updateTip(i, "title", e.target.value)}
                    placeholder={isFr ? `Titre du conseil ${i + 1}` : `Tip ${i + 1} title`}
                    className="text-sm"
                  />
                  <Textarea
                    value={tip.text}
                    onChange={(e) => updateTip(i, "text", e.target.value)}
                    placeholder={isFr ? "Contenu du conseil..." : "Tip content..."}
                    rows={2}
                    className="resize-none text-sm"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 mt-1"
                  onClick={() => removeTip(i)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addTip}>
              <Plus className="size-4 mr-1" />
              {isFr ? "Ajouter un conseil" : "Add tip"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">FAQ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Titre de la FAQ" : "FAQ Title"}
            </Label>
            <Input
              value={data.faqTitle || ""}
              onChange={(e) => update("faqTitle", e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <Label className="text-xs text-neutral-500 font-medium">
              {isFr ? "Questions / Réponses" : "Questions / Answers"}
            </Label>
            {faqItems.map((faq, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <Input
                    value={faq.question}
                    onChange={(e) => updateFaq(i, "question", e.target.value)}
                    placeholder={isFr ? `Question ${i + 1}` : `Question ${i + 1}`}
                    className="text-sm"
                  />
                  <Textarea
                    value={faq.answer}
                    onChange={(e) => updateFaq(i, "answer", e.target.value)}
                    placeholder={isFr ? "Réponse..." : "Answer..."}
                    rows={3}
                    className="resize-none text-sm"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 mt-1"
                  onClick={() => removeFaq(i)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addFaq}>
              <Plus className="size-4 mr-1" />
              {isFr ? "Ajouter une question" : "Add question"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {isFr ? "Appel à l'action (CTA)" : "Call to Action (CTA)"}
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
            <Textarea
              value={data.ctaText || ""}
              onChange={(e) => update("ctaText", e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Texte du bouton" : "Button Text"}
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
