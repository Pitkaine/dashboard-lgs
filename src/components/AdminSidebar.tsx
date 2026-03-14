"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  BookOpen,
  Camera,
  DollarSign,
  ExternalLink,
  FileText,
  Globe,
  LogOut,
  Menu,
  MessageSquareQuote,
  Settings,
  HelpCircle,
  MessageCircleQuestion,
  Mail,
  Users,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { title: "Tableau de bord", href: "/", icon: BarChart3 },
  { title: "Pages", href: "/pages", icon: FileText },
  { title: "Blog", href: "/blog", icon: BookOpen },
  { title: "Portfolio", href: "/portfolio", icon: Camera },
  { title: "Tarifs", href: "/tarifs", icon: DollarSign },
  { title: "Pages geo", href: "/geo", icon: Globe },
  { title: "Equipe", href: "/equipe", icon: Users },
  { title: "Avis", href: "/avis", icon: MessageSquareQuote },
  { title: "FAQ", href: "/faq", icon: MessageCircleQuestion },
  { title: "Messages", href: "/messages", icon: Mail },
  { title: "Parametres", href: "/parametres", icon: Settings },
  { title: "Guide", href: "/guide", icon: HelpCircle },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-center py-6 border-b border-white/10">
        <Image
          src="/logo.webp"
          alt="Les Gars Sympas"
          width={80}
          height={73}
          className="w-16 h-auto"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors " +
                (active
                  ? "bg-amber-600/20 text-amber-400"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white")
              }
            >
              <Icon className="size-5 shrink-0" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* External link */}
      <div className="px-3 pb-2">
        <a
          href="https://www.lesgarssympas.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          <ExternalLink className="size-3.5" />
          Voir le site
        </a>
      </div>

      {/* User info + logout */}
      <div className="border-t border-white/10 px-3 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="bg-amber-600/30 text-amber-400 text-xs">
              {session?.user?.name?.charAt(0)?.toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {session?.user?.name || "Admin"}
            </p>
            <p className="text-xs text-neutral-500 truncate">
              {session?.user?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-neutral-400 hover:text-red-400 shrink-0 cursor-pointer"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-[#1a1a2e] text-white"
      >
        <Menu className="size-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#1a1a2e] flex flex-col lg:hidden transition-transform " +
          (mobileOpen ? "translate-x-0" : "-translate-x-full")
        }
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white"
        >
          <X className="size-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[#1a1a2e]">
        {sidebarContent}
      </aside>
    </>
  );
}
