"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import type { AboutPageBody } from "./page-types";

interface Props {
  body: Record<string, unknown> | null;
  onChange: (body: Record<string, unknown>) => void;
  lang: "fr" | "en";
}

export default function AboutPageEditor({ body, onChange, lang }: Props) {
  const data = (body || {}) as Partial<AboutPageBody>;
  const isFr = lang === "fr";

  const update = (field: string, value: unknown) => {
    onChange({ ...body, [field]: value });
  };

  // ── Story paragraphs ──
  const storyParagraphs: string[] = (data.storyParagraphs || []) as string[];
  const updateStoryParagraph = (index: number, value: string) => {
    const p = [...storyParagraphs];
    p[index] = value;
    update("storyParagraphs", p);
  };
  const addStoryParagraph = () =>
    update("storyParagraphs", [...storyParagraphs, ""]);
  const removeStoryParagraph = (index: number) =>
    update(
      "storyParagraphs",
      storyParagraphs.filter((_: string, i: number) => i !== index)
    );

  // ── Numbers ──
  const numbers: Array<{ value: string; label: string }> = (data.numbers ||
    []) as Array<{ value: string; label: string }>;
  const updateNumber = (index: number, field: string, value: string) => {
    const n = [...numbers];
    n[index] = { ...n[index], [field]: value };
    update("numbers", n);
  };
  const addNumber = () =>
    update("numbers", [...numbers, { value: "", label: "" }]);
  const removeNumber = (index: number) =>
    update(
      "numbers",
      numbers.filter(
        (_: { value: string; label: string }, i: number) => i !== index
      )
    );

  // ── Team ──
  const team: Array<{
    name: string;
    role: string;
    bio: string;
    image: string;
  }> = (data.team || []) as Array<{
    name: string;
    role: string;
    bio: string;
    image: string;
  }>;
  const updateTeamMember = (index: number, field: string, value: string) => {
    const t = [...team];
    t[index] = { ...t[index], [field]: value };
    update("team", t);
  };
  const addTeamMember = () =>
    update("team", [
      ...team,
      { name: "", role: "", bio: "", image: "" },
    ]);
  const removeTeamMember = (index: number) =>
    update(
      "team",
      team.filter(
        (
          _: { name: string; role: string; bio: string; image: string },
          i: number
        ) => i !== index
      )
    );

  // ── Philosophy paragraphs ──
  const philosophyParagraphs: string[] = (data.philosophyParagraphs ||
    []) as string[];
  const updatePhilosophyParagraph = (index: number, value: string) => {
    const p = [...philosophyParagraphs];
    p[index] = value;
    update("philosophyParagraphs", p);
  };
  const addPhilosophyParagraph = () =>
    update("philosophyParagraphs", [...philosophyParagraphs, ""]);
  const removePhilosophyParagraph = (index: number) =>
    update(
      "philosophyParagraphs",
      philosophyParagraphs.filter((_: string, i: number) => i !== index)
    );

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
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Image hero (URL)" : "Hero Image (URL)"}
            </Label>
            <Input
              value={data.heroImage || ""}
              onChange={(e) => update("heroImage", e.target.value)}
              placeholder="/uploads/..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Story */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {isFr ? "Notre histoire" : "Our Story"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Titre de section" : "Section Title"}
            </Label>
            <Input
              value={data.storyTitle || ""}
              onChange={(e) => update("storyTitle", e.target.value)}
            />
          </div>
          {storyParagraphs.map((para: string, i: number) => (
            <div key={i} className="flex gap-2">
              <Textarea
                value={para}
                onChange={(e) => updateStoryParagraph(i, e.target.value)}
                rows={3}
                className="resize-none"
                placeholder={`${isFr ? "Paragraphe" : "Paragraph"} ${i + 1}`}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeStoryParagraph(i)}
                className="text-red-500 shrink-0 mt-1"
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addStoryParagraph}
            className="w-full"
          >
            <Plus className="size-3 mr-1" />
            {isFr ? "Ajouter paragraphe" : "Add paragraph"}
          </Button>
        </CardContent>
      </Card>

      {/* Numbers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {isFr ? "Chiffres cl\u00e9s" : "Key Numbers"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {numbers.map(
            (num: { value: string; label: string }, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={num.value}
                  onChange={(e) => updateNumber(i, "value", e.target.value)}
                  placeholder={isFr ? "Valeur (ex: 200+)" : "Value (e.g. 200+)"}
                  className="text-sm w-32"
                />
                <Input
                  value={num.label}
                  onChange={(e) => updateNumber(i, "label", e.target.value)}
                  placeholder="Label"
                  className="text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNumber(i)}
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
            onClick={addNumber}
            className="w-full"
          >
            <Plus className="size-3 mr-1" />
            {isFr ? "Ajouter un chiffre" : "Add number"}
          </Button>
        </CardContent>
      </Card>

      {/* Team */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {isFr ? "\u00c9quipe" : "Team"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {team.map(
            (
              member: {
                name: string;
                role: string;
                bio: string;
                image: string;
              },
              i: number
            ) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">
                    {member.name ||
                      `${isFr ? "Membre" : "Member"} ${i + 1}`}
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTeamMember(i)}
                    className="text-red-500"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-neutral-500">
                      {isFr ? "Nom" : "Name"}
                    </Label>
                    <Input
                      value={member.name}
                      onChange={(e) =>
                        updateTeamMember(i, "name", e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-neutral-500">
                      {isFr ? "R\u00f4le" : "Role"}
                    </Label>
                    <Input
                      value={member.role}
                      onChange={(e) =>
                        updateTeamMember(i, "role", e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-neutral-500">Bio</Label>
                  <Textarea
                    value={member.bio}
                    onChange={(e) =>
                      updateTeamMember(i, "bio", e.target.value)
                    }
                    rows={3}
                    className="resize-none text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-neutral-500">
                    {isFr ? "Image (URL)" : "Image (URL)"}
                  </Label>
                  <Input
                    value={member.image}
                    onChange={(e) =>
                      updateTeamMember(i, "image", e.target.value)
                    }
                    className="text-sm"
                    placeholder="/uploads/..."
                  />
                </div>
              </div>
            )
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={addTeamMember}
            className="w-full"
          >
            <Plus className="size-3 mr-1" />
            {isFr ? "Ajouter un membre" : "Add member"}
          </Button>
        </CardContent>
      </Card>

      {/* Philosophy */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {isFr ? "Philosophie" : "Philosophy"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Titre" : "Title"}
            </Label>
            <Input
              value={data.philosophyTitle || ""}
              onChange={(e) => update("philosophyTitle", e.target.value)}
            />
          </div>
          {philosophyParagraphs.map((para: string, i: number) => (
            <div key={i} className="flex gap-2">
              <Textarea
                value={para}
                onChange={(e) =>
                  updatePhilosophyParagraph(i, e.target.value)
                }
                rows={3}
                className="resize-none"
                placeholder={`${isFr ? "Paragraphe" : "Paragraph"} ${i + 1}`}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removePhilosophyParagraph(i)}
                className="text-red-500 shrink-0 mt-1"
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addPhilosophyParagraph}
            className="w-full"
          >
            <Plus className="size-3 mr-1" />
            {isFr ? "Ajouter paragraphe" : "Add paragraph"}
          </Button>
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
