"use client";

import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  ImageIcon,
  Youtube,
  LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  Highlighter,
  Code,
  TableIcon,
  Minus,
} from "lucide-react";
import { useCallback, useState } from "react";

interface EditorToolbarProps {
  editor: Editor;
  onAddImage: () => void;
  onAddYoutube: (url: string) => void;
}

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`h-8 w-8 p-0 ${
        isActive
          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
          : "text-neutral-600 hover:bg-neutral-100"
      }`}
    >
      {children}
    </Button>
  );
}

export default function EditorToolbar({
  editor,
  onAddImage,
  onAddYoutube,
}: EditorToolbarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const handleLink = useCallback(() => {
    if (showLinkInput) {
      if (linkUrl) {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: linkUrl })
          .run();
      }
      setShowLinkInput(false);
      setLinkUrl("");
    } else {
      const existingUrl = editor.getAttributes("link").href;
      setLinkUrl(existingUrl || "");
      setShowLinkInput(true);
    }
  }, [editor, linkUrl, showLinkInput]);

  const removeLink = useCallback(() => {
    editor.chain().focus().unsetLink().run();
    setShowLinkInput(false);
    setLinkUrl("");
  }, [editor]);

  const handleYoutube = useCallback(() => {
    if (showYoutubeInput) {
      if (youtubeUrl) {
        onAddYoutube(youtubeUrl);
      }
      setShowYoutubeInput(false);
      setYoutubeUrl("");
    } else {
      setShowYoutubeInput(true);
    }
  }, [youtubeUrl, showYoutubeInput, onAddYoutube]);

  const addTable = useCallback(() => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);

  return (
    <div className="border-b border-neutral-200 bg-neutral-50">
      {/* Main toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5">
        {/* Headings */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
          title="Titre 1"
        >
          <Heading1 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          title="Titre 2"
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          title="Titre 3"
        >
          <Heading3 className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Gras"
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italique"
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Barré"
        >
          <Strikethrough className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          title="Code"
        >
          <Code className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive("highlight")}
          title="Surligner"
        >
          <Highlighter className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Link */}
        <ToolbarButton
          onClick={handleLink}
          isActive={editor.isActive("link")}
          title="Lien"
        >
          <LinkIcon className="size-4" />
        </ToolbarButton>

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Liste à puces"
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Liste numérotée"
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Citation"
        >
          <Quote className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Aligner à gauche"
        >
          <AlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Centrer"
        >
          <AlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Aligner à droite"
        >
          <AlignRight className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Media */}
        <ToolbarButton onClick={onAddImage} title="Insérer une image">
          <ImageIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setShowYoutubeInput(!showYoutubeInput)}
          title="Insérer une vidéo YouTube"
        >
          <Youtube className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addTable} title="Insérer un tableau">
          <TableIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Ligne horizontale"
        >
          <Minus className="size-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Annuler"
        >
          <Undo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Rétablir"
        >
          <Redo2 className="size-4" />
        </ToolbarButton>
      </div>

      {/* Link input bar */}
      {showLinkInput && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-neutral-200 bg-white">
          <LinkIcon className="size-4 text-neutral-400 shrink-0" />
          <input
            type="url"
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLink();
              if (e.key === "Escape") {
                setShowLinkInput(false);
                setLinkUrl("");
              }
            }}
            className="flex-1 text-sm bg-transparent outline-none text-neutral-800 placeholder:text-neutral-400"
            autoFocus
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleLink}
            className="h-7 text-xs text-amber-600 hover:text-amber-700"
          >
            Appliquer
          </Button>
          {editor.isActive("link") && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={removeLink}
              className="h-7 text-xs text-red-500 hover:text-red-600"
            >
              Supprimer
            </Button>
          )}
        </div>
      )}

      {/* YouTube input bar */}
      {showYoutubeInput && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-neutral-200 bg-white">
          <Youtube className="size-4 text-neutral-400 shrink-0" />
          <input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleYoutube();
              if (e.key === "Escape") {
                setShowYoutubeInput(false);
                setYoutubeUrl("");
              }
            }}
            className="flex-1 text-sm bg-transparent outline-none text-neutral-800 placeholder:text-neutral-400"
            autoFocus
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleYoutube}
            className="h-7 text-xs text-amber-600 hover:text-amber-700"
          >
            Insérer
          </Button>
        </div>
      )}
    </div>
  );
}
