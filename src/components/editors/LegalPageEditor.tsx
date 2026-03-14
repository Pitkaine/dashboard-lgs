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
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { LegalPageBody, LegalBlock } from "./page-types";

interface Props {
  body: Record<string, unknown> | null;
  onChange: (body: Record<string, unknown>) => void;
  lang: "fr" | "en";
}

export default function LegalPageEditor({ body, onChange, lang }: Props) {
  const data = (body || {}) as Partial<LegalPageBody>;
  const isFr = lang === "fr";

  const update = (field: string, value: unknown) => {
    onChange({ ...body, [field]: value });
  };

  const blocks: LegalBlock[] = (data.blocks || []) as LegalBlock[];

  const updateBlock = (index: number, updates: Partial<LegalBlock>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    update("blocks", newBlocks);
  };

  const addBlock = () => {
    const newBlock: LegalBlock = {
      key: `block-${Date.now()}`,
      title: "",
      type: "paragraph",
      text: "",
    };
    update("blocks", [...blocks, newBlock]);
  };

  const removeBlock = (index: number) => {
    update("blocks", blocks.filter((_: LegalBlock, i: number) => i !== index));
  };

  const updateBlockItem = (blockIndex: number, itemIndex: number, value: string) => {
    const newBlocks = [...blocks];
    const items = [...(newBlocks[blockIndex].items || [])];
    items[itemIndex] = value;
    newBlocks[blockIndex] = { ...newBlocks[blockIndex], items };
    update("blocks", newBlocks);
  };

  const addBlockItem = (blockIndex: number) => {
    const newBlocks = [...blocks];
    const items = [...(newBlocks[blockIndex].items || []), ""];
    newBlocks[blockIndex] = { ...newBlocks[blockIndex], items };
    update("blocks", newBlocks);
  };

  const removeBlockItem = (blockIndex: number, itemIndex: number) => {
    const newBlocks = [...blocks];
    const items = (newBlocks[blockIndex].items || []).filter((_: string, i: number) => i !== itemIndex);
    newBlocks[blockIndex] = { ...newBlocks[blockIndex], items };
    update("blocks", newBlocks);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {isFr ? "En-t\u00eate de page" : "Page Header"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Titre de la page" : "Page Title"}
            </Label>
            <Input
              value={data.pageTitle || ""}
              onChange={(e) => update("pageTitle", e.target.value)}
            />
          </div>
          {(data.intro !== undefined || body === null) && (
            <div className="space-y-2">
              <Label className="text-xs text-neutral-500">
                {isFr ? "Introduction (optionnel)" : "Introduction (optional)"}
              </Label>
              <Textarea
                value={data.intro || ""}
                onChange={(e) => update("intro", e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              {isFr ? "Derni\u00e8re mise \u00e0 jour" : "Last Updated"}
            </Label>
            <Input
              value={data.lastUpdate || ""}
              onChange={(e) => update("lastUpdate", e.target.value)}
              placeholder="Mars 2026"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Blocks */}
      {blocks.map((block: LegalBlock, bi: number) => (
        <Card key={block.key || bi}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <GripVertical className="size-4 text-neutral-400" />
                {block.title || `Bloc ${bi + 1}`}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeBlock(bi)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-neutral-500">
                  {isFr ? "Cl\u00e9 unique" : "Unique Key"}
                </Label>
                <Input
                  value={block.key || ""}
                  onChange={(e) => updateBlock(bi, { key: e.target.value })}
                  className="text-sm font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-neutral-500">Type</Label>
                <Select
                  value={block.type || "paragraph"}
                  onValueChange={(v) => updateBlock(bi, { type: v as LegalBlock["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paragraph">{isFr ? "Paragraphe" : "Paragraph"}</SelectItem>
                    <SelectItem value="keyvalue">{isFr ? "Cl\u00e9-Valeur" : "Key-Value"}</SelectItem>
                    <SelectItem value="list">{isFr ? "Liste" : "List"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-neutral-500">
                {isFr ? "Titre du bloc" : "Block Title"}
              </Label>
              <Input
                value={block.title || ""}
                onChange={(e) => updateBlock(bi, { title: e.target.value })}
              />
            </div>

            {block.type === "paragraph" && (
              <div className="space-y-2">
                <Label className="text-xs text-neutral-500">
                  {isFr ? "Texte" : "Text"}
                </Label>
                <Textarea
                  value={block.text || ""}
                  onChange={(e) => updateBlock(bi, { text: e.target.value })}
                  rows={4}
                  className="resize-none"
                />
              </div>
            )}

            {(block.type === "keyvalue" || block.type === "list") && (
              <div className="space-y-3">
                {block.type === "list" && (
                  <div className="space-y-2">
                    <Label className="text-xs text-neutral-500">
                      {isFr ? "Introduction de la liste" : "List Introduction"}
                    </Label>
                    <Textarea
                      value={block.intro || ""}
                      onChange={(e) => updateBlock(bi, { intro: e.target.value })}
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                )}
                <Label className="text-xs text-neutral-500">
                  {isFr ? "\u00c9l\u00e9ments" : "Items"}
                </Label>
                {(block.items || []).map((item: string, ii: number) => (
                  <div key={ii} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateBlockItem(bi, ii, e.target.value)}
                      placeholder={`${isFr ? "\u00c9l\u00e9ment" : "Item"} ${ii + 1}`}
                      className="text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBlockItem(bi, ii)}
                      className="text-red-500 shrink-0"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBlockItem(bi)}
                  className="w-full"
                >
                  <Plus className="size-3 mr-1" />
                  {isFr ? "Ajouter un \u00e9l\u00e9ment" : "Add item"}
                </Button>
              </div>
            )}

            {block.type === "paragraph" && (
              <div className="space-y-2 border-t pt-4">
                <Label className="text-xs text-neutral-500">
                  {isFr ? "Lien optionnel" : "Optional Link"}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={block.link?.text || ""}
                    onChange={(e) =>
                      updateBlock(bi, {
                        link: { text: e.target.value, href: block.link?.href || "" },
                      })
                    }
                    placeholder={isFr ? "Texte du lien" : "Link text"}
                    className="text-sm"
                  />
                  <Input
                    value={block.link?.href || ""}
                    onChange={(e) =>
                      updateBlock(bi, {
                        link: { text: block.link?.text || "", href: e.target.value },
                      })
                    }
                    placeholder="/path"
                    className="text-sm font-mono"
                  />
                </div>
              </div>
            )}

            {block.type === "list" && (
              <div className="space-y-2">
                <Label className="text-xs text-neutral-500">
                  {isFr ? "Texte de pied de bloc" : "Block Footer"}
                </Label>
                <Input
                  value={block.footer || ""}
                  onChange={(e) => updateBlock(bi, { footer: e.target.value })}
                  className="text-sm"
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outline"
        onClick={addBlock}
        className="w-full border-dashed"
      >
        <Plus className="size-4 mr-2" />
        {isFr ? "Ajouter un bloc" : "Add Block"}
      </Button>
    </div>
  );
}
