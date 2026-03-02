"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import Heading from "@tiptap/extension-heading";
import { useCallback, useEffect } from "react";
import type { JSONContent } from "@tiptap/react";
import EditorToolbar from "./EditorToolbar";

interface TiptapEditorProps {
  content?: JSONContent | null;
  onChange?: (json: JSONContent) => void;
  placeholder?: string;
  onImageUpload?: () => void;
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = "Commencez à écrire...",
  onImageUpload,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({
        levels: [1, 2, 3, 4],
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: "w-full aspect-video rounded-lg",
        },
        inline: false,
        width: 640,
        height: 360,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-amber-600 underline cursor-pointer",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
      Color,
      TextStyle,
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: content || undefined,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base max-w-none min-h-[400px] p-4 focus:outline-none " +
          "prose-headings:text-neutral-900 prose-p:text-neutral-700 " +
          "prose-a:text-amber-600 prose-strong:text-neutral-900 " +
          "prose-blockquote:border-l-amber-500 prose-blockquote:text-neutral-600 " +
          "prose-img:rounded-lg prose-img:mx-auto",
      },
    },
    immediatelyRender: false,
  });

  // Update content when prop changes (e.g. switching language tab)
  useEffect(() => {
    if (editor && content) {
      const currentContent = JSON.stringify(editor.getJSON());
      const newContent = JSON.stringify(content);
      if (currentContent !== newContent) {
        editor.commands.setContent(content);
      }
    }
  }, [editor, content]);

  const handleAddImage = useCallback(
    (url: string) => {
      if (editor) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    },
    [editor]
  );

  const handleAddYoutube = useCallback(
    (url: string) => {
      if (editor) {
        editor.chain().focus().setYoutubeVideo({ src: url }).run();
      }
    },
    [editor]
  );

  if (!editor) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-4 min-h-[400px] animate-pulse" />
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
      <EditorToolbar
        editor={editor}
        onAddImage={onImageUpload || (() => {})}
        onAddYoutube={handleAddYoutube}
      />
      <EditorContent editor={editor} />
    </div>
  );
}

export { type TiptapEditorProps };
