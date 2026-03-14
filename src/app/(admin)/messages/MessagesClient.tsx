"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mail,
  MailOpen,
  Trash2,
  Phone,
  Calendar,
  MapPin,
  Users,
  Camera,
  Search,
  CheckCheck,
  AlertCircle,
} from "lucide-react";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  weddingDate: string | null;
  venue: string | null;
  guests: string | null;
  serviceType: string | null;
  referral: string | null;
  message: string;
  locale: string;
  isRead: boolean;
  emailSent: boolean;
  createdAt: string;
}

const SERVICE_LABELS: Record<string, string> = {
  photo: "Photo",
  video: "Vidéo",
  all: "Photo & Vidéo",
};

const SOURCE_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  "mariages.net": "Mariages.net",
  google: "Google",
  recommendation: "Recommandation",
  other: "Autre",
};

export default function MessagesClient({
  initialMessages,
  initialUnread,
}: {
  initialMessages: ContactMessage[];
  initialUnread: number;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [unreadCount, setUnreadCount] = useState(initialUnread);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const selected = messages.find((m) => m.id === selectedId);

  const filtered = messages.filter((m) => {
    if (filter === "unread" && m.isRead) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.venue?.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  async function toggleRead(msg: ContactMessage) {
    const newRead = !msg.isRead;
    await fetch(`/api/messages/${msg.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: newRead }),
    });
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, isRead: newRead } : m))
    );
    setUnreadCount((c) => c + (newRead ? -1 : 1));
  }

  async function deleteMessage(id: number) {
    if (!confirm("Supprimer ce message ?")) return;
    await fetch(`/api/messages/${id}`, { method: "DELETE" });
    const msg = messages.find((m) => m.id === id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (msg && !msg.isRead) setUnreadCount((c) => c - 1);
    if (selectedId === id) setSelectedId(null);
  }

  async function selectMessage(msg: ContactMessage) {
    setSelectedId(msg.id);
    if (!msg.isRead) {
      await fetch(`/api/messages/${msg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
      );
      setUnreadCount((c) => c - 1);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Messages</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} non lu${unreadCount > 1 ? "s" : ""}`
              : "Tous les messages sont lus"}
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-1">
          {messages.length}
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Tous
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unread")}
        >
          Non lus {unreadCount > 0 && `(${unreadCount})`}
        </Button>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" style={{ minHeight: "calc(100vh - 220px)" }}>
        {/* Message list */}
        <div className="lg:col-span-2 space-y-2 overflow-y-auto max-h-[calc(100vh-220px)]">
          {filtered.length === 0 ? (
            <p className="text-center text-neutral-400 py-12">Aucun message</p>
          ) : (
            filtered.map((msg) => (
              <Card
                key={msg.id}
                className={`cursor-pointer transition-colors hover:bg-neutral-50 ${
                  selectedId === msg.id ? "ring-2 ring-amber-500" : ""
                } ${!msg.isRead ? "bg-amber-50/50 border-amber-200" : ""}`}
                onClick={() => selectMessage(msg)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {!msg.isRead && (
                          <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                        )}
                        <span className={`text-sm truncate ${!msg.isRead ? "font-semibold" : ""}`}>
                          {msg.name}
                        </span>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {msg.locale.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-500 truncate mt-0.5">
                        {msg.email}
                      </p>
                      <p className="text-xs text-neutral-400 truncate mt-1">
                        {msg.message.slice(0, 80)}...
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-neutral-400">
                        {formatDate(msg.createdAt)}
                      </p>
                      {!msg.emailSent && (
                        <span title="Email non envoyé">
                          <AlertCircle className="size-3.5 text-orange-400 mt-1 ml-auto" />
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Message detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <Card className="h-full">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">
                      {selected.name}
                    </h2>
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-sm text-amber-600 hover:underline"
                    >
                      {selected.email}
                    </a>
                    <p className="text-xs text-neutral-400 mt-1">
                      {formatDate(selected.createdAt)}
                      {!selected.emailSent && (
                        <span className="text-orange-500 ml-2">
                          ⚠ Email de notification non envoyé
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleRead(selected)}
                      title={selected.isRead ? "Marquer non lu" : "Marquer lu"}
                    >
                      {selected.isRead ? (
                        <MailOpen className="size-4" />
                      ) : (
                        <Mail className="size-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMessage(selected.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {selected.phone && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Phone className="size-4 text-neutral-400" />
                      <a href={`tel:${selected.phone}`} className="hover:text-amber-600">
                        {selected.phone}
                      </a>
                    </div>
                  )}
                  {selected.weddingDate && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Calendar className="size-4 text-neutral-400" />
                      {selected.weddingDate}
                    </div>
                  )}
                  {selected.venue && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <MapPin className="size-4 text-neutral-400" />
                      {selected.venue}
                    </div>
                  )}
                  {selected.guests && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Users className="size-4 text-neutral-400" />
                      {selected.guests} invités
                    </div>
                  )}
                  {selected.serviceType && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Camera className="size-4 text-neutral-400" />
                      {SERVICE_LABELS[selected.serviceType] || selected.serviceType}
                    </div>
                  )}
                  {selected.referral && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Search className="size-4 text-neutral-400" />
                      {SOURCE_LABELS[selected.referral] || selected.referral}
                    </div>
                  )}
                </div>

                {/* Message */}
                <div className="bg-neutral-50 rounded-lg p-4 border">
                  <p className="text-xs text-neutral-400 uppercase font-semibold tracking-wide mb-2">
                    Message
                  </p>
                  <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
                    {selected.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                  <Button asChild className="bg-amber-600 hover:bg-amber-700">
                    <a href={`mailto:${selected.email}`}>
                      <Mail className="size-4 mr-2" />
                      Répondre par email
                    </a>
                  </Button>
                  {selected.phone && (
                    <Button variant="outline" asChild>
                      <a href={`https://wa.me/${selected.phone.replace(/[^0-9+]/g, "")}`} target="_blank">
                        WhatsApp
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center text-neutral-400">
                <CheckCheck className="size-12 mx-auto mb-3 opacity-30" />
                <p>Sélectionnez un message</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
