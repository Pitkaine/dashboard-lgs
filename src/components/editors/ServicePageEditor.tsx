"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { ServicePageBody, ServiceSection } from "./page-types";

interface Props {
  body: Record<string, unknown> | null;
  onChange: (body: Record<string, unknown>) => void;
  lang: "fr" | "en";
}

export default function ServicePageEditor({ body, onChange, lang }: Props) {
  const data = (body || {}) as Partial<ServicePageBody>;
  const isFr = lang === "fr";

  const update = (field: string, value: unknown) => {
    onChange({ ...body, [field]: value });
  };

  const sections: ServiceSection[] = (data.sections || []) as ServiceSection[];
  const faqItems = data.faqItems || [];

  // ── Section helpers ──
  const updateSection = (index: number, updates: Partial<ServiceSection>) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], ...updates };
    update("sections", newSections);
  };

  const addSection = () => {
    update("sections", [
      ...sections,
      { title: "", text: "", type: "paragraph" as const },
    ]);
  };

  const removeSection = (index: number) => {
    update(
      "sections",
      sections.filter((_: ServiceSection, i: number) => i !== index)
    );
  };

  // List items within a section
  const updateSectionItem = (si: number, ii: number, value: string) => {
    const newSections = [...sections];
    const items = [...(newSections[si].items || [])];
    items[ii] = value;
    newSections[si] = { ...newSections[si], items };
    update("sections", newSections);
  };

  const addSectionItem = (si: number) => {
    const newSections = [...sections];
    newSections[si] = {
      ...newSections[si],
      items: [...(newSections[si].items || []), ""],
    };
    update("sections", newSections);
  };

  const removeSectionItem = (si: number, ii: number) => {
    const newSections = [...sections];
    newSections[si] = {
      ...newSections[si],
      items: (newSections[si].items || []).filter(
        (_: string, i: number) => i !== ii
      ),
    };
    update("sections", newSections);
  };

  // Location helpers
  const updateLocation = (
    si: number,
    li: number,
    field: string,
    value: string
  ) => {
    const newSections = [...sections];
    const locations = [...(newSections[si].locations || [])];
    locations[li] = { ...locations[li], [field]: value };
    newSections[si] = { ...newSections[si], locations };
    update("sections", newSections);
  };

  const addLocation = (si: number) => {
    const newSections = [...sections];
    newSections[si] = {
      ...newSections[si],
      locations: [
        ...(newSections[si].locations || []),
        { region: "", details: "" },
      ],
    };
    update("sections", newSections);
  };

  const removeLocation = (si: number, li: number) => {
    const newSections = [...sections];
    newSections[si] = {
      ...newSections[si],
      locations: (newSections[si].locations || []).filter(
        (_: { region: string; details: string }, i: number) => i !== li
      ),
    };
    update("sections", newSections);
  };

  // ── FAQ helpers ──
  const updateFaqItem = (index: number, field: string, value: string) => {
    const newItems = [...faqItems];
    newItems[index] = { ...newItems[index], [field]: value };
    update("faqItems", newItems);
  };

  const addFaqItem = () => {
    update("faqItems", [...faqItems, { question: "", answer: "" }]);
  };

  const removeFaqItem = (index: number) => {
    update(
      "faqItems",
      faqItems.filter(
        (_: { question: string; answer: string }, i: number) => i !== index
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Hero</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Titre (H1)" : "Title (H1)"}
            </Label>
            <Input
              value={data.heroTitle || ""}
              onChange={(e) => update("heroTitle", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Sous-titre" : "Subtitle"}
            </Label>
            <Input
              value={data.heroSubtitle || ""}
              onChange={(e) => update("heroSubtitle", e.target.value)}
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
            rows={5}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Dynamic Sections */}
      {sections.map((section: ServiceSection, si: number) => (
        <Card key={si}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Section {si + 1}: {section.title || "..."}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeSection(si)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[1fr_150px] gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-neutral-500">
                  {isFr ? "Titre" : "Title"}
                </Label>
                <Input
                  value={section.title || ""}
                  onChange={(e) =>
                    updateSection(si, { title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-neutral-500">Type</Label>
                <Select
                  value={section.type || "paragraph"}
                  onValueChange={(v) =>
                    updateSection(si, {
                      type: v as ServiceSection["type"],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paragraph">
                      {isFr ? "Paragraphe" : "Paragraph"}
                    </SelectItem>
                    <SelectItem value="list">
                      {isFr ? "Liste" : "List"}
                    </SelectItem>
                    <SelectItem value="locations">
                      {isFr ? "Lieux" : "Locations"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-neutral-500">
                {isFr ? "Texte" : "Text"}
              </Label>
              <Textarea
                value={section.text || ""}
                onChange={(e) =>
                  updateSection(si, { text: e.target.value })
                }
                rows={4}
                className="resize-none"
              />
            </div>

            {section.type === "list" && (
              <div className="space-y-3 border-t pt-4">
                <Label className="text-xs text-neutral-500">
                  {isFr ? "\u00c9l\u00e9ments de liste" : "List Items"}
                </Label>
                {(section.items || []).map((item: string, ii: number) => (
                  <div key={ii} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) =>
                        updateSectionItem(si, ii, e.target.value)
                      }
                      className="text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSectionItem(si, ii)}
                      className="text-red-500 shrink-0"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addSectionItem(si)}
                  className="w-full"
                >
                  <Plus className="size-3 mr-1" />
                  {isFr ? "Ajouter" : "Add"}
                </Button>
              </div>
            )}

            {section.type === "locations" && (
              <div className="space-y-3 border-t pt-4">
                <Label className="text-xs text-neutral-500">
                  {isFr ? "Lieux" : "Locations"}
                </Label>
                {(section.locations || []).map(
                  (
                    loc: { region: string; details: string },
                    li: number
                  ) => (
                    <div key={li} className="flex items-center gap-2">
                      <Input
                        value={loc.region}
                        onChange={(e) =>
                          updateLocation(si, li, "region", e.target.value)
                        }
                        placeholder={isFr ? "R\u00e9gion" : "Region"}
                        className="text-sm"
                      />
                      <Input
                        value={loc.details}
                        onChange={(e) =>
                          updateLocation(si, li, "details", e.target.value)
                        }
                        placeholder={isFr ? "D\u00e9tails" : "Details"}
                        className="text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLocation(si, li)}
                        className="text-red-500 shrink-0"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  )
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addLocation(si)}
                  className="w-full"
                >
                  <Plus className="size-3 mr-1" />
                  {isFr ? "Ajouter un lieu" : "Add location"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outline"
        onClick={addSection}
        className="w-full border-dashed"
      >
        <Plus className="size-4 mr-2" />
        {isFr ? "Ajouter une section" : "Add Section"}
      </Button>

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
          {faqItems.map(
            (item: { question: string; answer: string }, fi: number) => (
              <div key={fi} className="space-y-2 border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-neutral-500 font-medium">
                    Q&A {fi + 1}
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFaqItem(fi)}
                    className="text-red-500"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
                <Input
                  value={item.question}
                  onChange={(e) =>
                    updateFaqItem(fi, "question", e.target.value)
                  }
                  placeholder="Question..."
                  className="text-sm font-medium"
                />
                <Textarea
                  value={item.answer}
                  onChange={(e) =>
                    updateFaqItem(fi, "answer", e.target.value)
                  }
                  placeholder={isFr ? "R\u00e9ponse..." : "Answer..."}
                  rows={3}
                  className="resize-none text-sm"
                />
              </div>
            )
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={addFaqItem}
            className="w-full"
          >
            <Plus className="size-3 mr-1" />
            {isFr ? "Ajouter Q&A" : "Add Q&A"}
          </Button>
        </CardContent>
      </Card>

      {/* Regions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {isFr ? "R\u00e9gions" : "Regions"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Titre" : "Title"}
            </Label>
            <Input
              value={data.regionsTitle || ""}
              onChange={(e) => update("regionsTitle", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Texte" : "Text"}
            </Label>
            <Textarea
              value={data.regionsText || ""}
              onChange={(e) => update("regionsText", e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-neutral-500">Bordeaux</Label>
              <Input
                value={data.regionBordeaux || ""}
                onChange={(e) => update("regionBordeaux", e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-neutral-500">Lyon</Label>
              <Input
                value={data.regionLyon || ""}
                onChange={(e) => update("regionLyon", e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-neutral-500">Provence</Label>
              <Input
                value={data.regionProvence || ""}
                onChange={(e) => update("regionProvence", e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-neutral-500">
                C\u00f4te d&apos;Azur
              </Label>
              <Input
                value={data.regionCoteAzur || ""}
                onChange={(e) => update("regionCoteAzur", e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">CTA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Titre" : "Title"}
            </Label>
            <Input
              value={data.ctaTitle || ""}
              onChange={(e) => update("ctaTitle", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Texte" : "Text"}
            </Label>
            <Input
              value={data.ctaText || ""}
              onChange={(e) => update("ctaText", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Bouton" : "Button"}
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
