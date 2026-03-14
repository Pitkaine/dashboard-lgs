"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import type { FaqPageBody } from "./page-types";

interface Props {
  body: Record<string, unknown> | null;
  onChange: (body: Record<string, unknown>) => void;
  lang: "fr" | "en";
}

export default function FaqPageEditor({ body, onChange, lang }: Props) {
  const data = (body || {}) as Partial<FaqPageBody>;
  const isFr = lang === "fr";

  const update = (field: string, value: unknown) => {
    onChange({ ...body, [field]: value });
  };

  const items: Array<{ question: string; answer: string }> = (data.items ||
    []) as Array<{ question: string; answer: string }>;

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    update("items", newItems);
  };

  const addItem = () => {
    update("items", [...items, { question: "", answer: "" }]);
  };

  const removeItem = (index: number) => {
    update(
      "items",
      items.filter(
        (_: { question: string; answer: string }, i: number) => i !== index
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {isFr ? "En-t\u00eate" : "Header"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Titre (H1)" : "Title (H1)"}
            </Label>
            <Input
              value={data.title || ""}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Sous-titre" : "Subtitle"}
            </Label>
            <Input
              value={data.subtitle || ""}
              onChange={(e) => update("subtitle", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Texte bouton retour" : "Back Button Text"}
            </Label>
            <Input
              value={data.back || ""}
              onChange={(e) => update("back", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* SEO Intro */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {isFr ? "Introduction SEO" : "SEO Introduction"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Titre intro" : "Intro Title"}
            </Label>
            <Input
              value={data.introTitle || ""}
              onChange={(e) => update("introTitle", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Paragraphe 1" : "Paragraph 1"}
            </Label>
            <Textarea
              value={data.introText || ""}
              onChange={(e) => update("introText", e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Paragraphe 2" : "Paragraph 2"}
            </Label>
            <Textarea
              value={data.introP2 || ""}
              onChange={(e) => update("introP2", e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Paragraphe 3" : "Paragraph 3"}
            </Label>
            <Textarea
              value={data.introP3 || ""}
              onChange={(e) => update("introP3", e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* FAQ Items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {isFr ? "Questions / R\u00e9ponses" : "Questions / Answers"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map(
            (item: { question: string; answer: string }, i: number) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-neutral-600">
                    Q&A {i + 1}
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(i)}
                    className="text-red-500"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-500">Question</Label>
                  <Input
                    value={item.question}
                    onChange={(e) =>
                      updateItem(i, "question", e.target.value)
                    }
                    className="text-sm font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-neutral-500">
                    {isFr ? "R\u00e9ponse" : "Answer"}
                  </Label>
                  <Textarea
                    value={item.answer}
                    onChange={(e) =>
                      updateItem(i, "answer", e.target.value)
                    }
                    rows={3}
                    className="resize-none text-sm"
                  />
                </div>
              </div>
            )
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={addItem}
            className="w-full"
          >
            <Plus className="size-3 mr-1" />
            {isFr ? "Ajouter une question" : "Add question"}
          </Button>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {isFr ? "Pied de page" : "Footer"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Texte 'pas de r\u00e9ponse'" : "'No answer' text"}
            </Label>
            <Input
              value={data.noresponse || ""}
              onChange={(e) => update("noresponse", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Texte lien contact" : "Contact link text"}
            </Label>
            <Input
              value={data.contact || ""}
              onChange={(e) => update("contact", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
