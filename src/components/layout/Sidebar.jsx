"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import {
  BotMessageSquare, Home, Pencil, User, Video,
  StickyNote, CalendarDays, X, Menu,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: <Home />, label: "Dashboard" },
  { href: "/dashboard/plano", icon: <CalendarDays />, label: "Plano de Estudos" },
  { href: "/dashboard/exercicios", icon: <Pencil />, label: "Exercícios" },
  { href: "/dashboard/redacao", icon: <StickyNote />, label: "Redação" },
  { href: "/dashboard/videos", icon: <Video />, label: "Videoaulas" },
  { href: "/dashboard/ia", icon: <BotMessageSquare />, label: "IA Tutora" },
  { href: "/dashboard/perfil", icon: <User />, label: "Perfil" },
];

const SECTIONS = [
  { label: "Principal", items: NAV_ITEMS.slice(0, 4) },
  { label: "Recursos", items: NAV_ITEMS.slice(4, 6) },
  { label: "Conta", items: NAV_ITEMS.slice(6) },
];

function diasParaEnem() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const enem = new Date(ano, 10, 8);
  if (enem < hoje) enem.setFullYear(ano + 1);
  return Math.ceil((enem - hoje) / (1000 * 60 * 60 * 24));
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const diasEnem = diasParaEnem();

  const sidebarContent = (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col py-6 px-4 h-full">
      <div className="px-3 mb-8 flex items-center justify-between">
        <Logo size="sm" />
        {/* Botão fechar — só no mobile */}
        <button
          className="md:hidden p-1 rounded-lg text-slate-400 hover:text-slate-700"
          onClick={() => setOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sora">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold font-sora transition-all duration-200 group",
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    )}
                  >
                    <span className={cn("text-lg w-6 text-center transition-transform duration-200", !isActive && "group-hover:scale-110")}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 px-1">
        <div className="bg-gradient-to-br from-brand-50 to-[#E8F5E9] rounded-2xl p-4 border border-brand-100/50 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/50 rounded-full blur-xl pointer-events-none" />
          <p className="text-[10px] font-bold text-brand-600/80 uppercase tracking-wider mb-1 relative z-10">
            Preparando para
          </p>
          <p className="font-sora font-extrabold text-slate-800 text-base mb-3 relative z-10">
            ENEM 2026
          </p>
          <div className="inline-flex items-center bg-white px-3 py-1.5 rounded-xl shadow-sm relative z-10 border border-white/50">
            <span className="text-xs font-bold text-brand-600">
              {`Faltam ${diasEnem} dias`}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* ── Desktop: sidebar fixa na esquerda ── */}
      <div className="hidden md:flex h-full">
        {sidebarContent}
      </div>

      {/* ── Mobile: topbar + drawer ── */}
      <div className="md:hidden">
        {/* Topbar fixa no topo */}
        <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
          <Logo size="sm" />
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Espaçador para o conteúdo não ficar atrás da topbar */}
        <div className="h-[57px]" />

        {/* Overlay escuro */}
        {open && (
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Sidebar deslizante */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 transition-transform duration-300",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
