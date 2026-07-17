"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "🏠", label: "Dashboard" },
  { href: "/dashboard/plano", icon: "📅", label: "Plano de Estudos" },
  { href: "/dashboard/exercicios", icon: "✏️", label: "Exercícios" },
  { href: "/dashboard/redacao", icon: "📝", label: "Redação" },
  { href: "/dashboard/videos", icon: "🎥", label: "Videoaulas" },
  { href: "/dashboard/ia", icon: "🤖", label: "IA Tutora" },
  { href: "/dashboard/perfil", icon: "👤", label: "Perfil" },
];

const SECTIONS = [
  { label: "Principal", items: NAV_ITEMS.slice(0, 4) },
  { label: "Recursos", items: NAV_ITEMS.slice(4, 6) },
  { label: "Conta", items: NAV_ITEMS.slice(6) },
];

export function Sidebar() {
  const pathname = usePathname();
 function diasParaEnem() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const enem = new Date(ano, 10, 8);
  if (enem < hoje) enem.setFullYear(ano + 1);
  const diff = Math.ceil((enem - hoje) / (1000 * 60 * 60 * 24));
  return diff;
}

const diasEnem = diasParaEnem()

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col py-6 px-4">
      <div className="px-3 mb-8">
        <Logo size="sm" />
      </div>

      <div className="flex-1 space-y-6">
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
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold font-sora transition-all duration-200 group",
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    )}
                  >
                    <span
                      className={cn(
                        "text-lg w-6 text-center transition-transform duration-200",
                        !isActive && "group-hover:scale-110"
                      )}
                    >
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

      {/* Prova badge at bottom */}
      <div className="mt-8 px-1">
        <div className="bg-gradient-to-br from-brand-50 to-[#E8F5E9] rounded-2xl p-4 border border-brand-100/50 shadow-sm relative overflow-hidden">
          {/* Efeito decorativo sutil de brilho no fundo */}
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/50 rounded-full blur-xl pointer-events-none" />
          
          <p className="text-[10px] font-bold text-brand-600/80 uppercase tracking-wider mb-1 relative z-10">
            Preparando para
          </p>
          <p className="font-sora font-extrabold text-slate-800 text-base mb-3 relative z-10">
            ENEM 2026
          </p>
          <div className="inline-flex items-center bg-white px-3 py-1.5 rounded-xl shadow-sm relative z-10 border border-white/50">
            <span className="text-xs font-bold text-brand-600">
              {diasEnem !== null ? `⏳ Faltam ${diasEnem} dias` : "Calculando..."}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
