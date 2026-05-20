"use client";

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

const data_atual = new Date()
const dia_atual = data_atual.getDate()
const mes_atual = data_atual.getMonth()
const dia_enem = 8
const mes_enem = 11
const dias_para_enem = (dia_atual > dia_enem)? dia_atual - dia_enem : dia_enem - data_atual
const mes_para_enem = (mes_atual > mes_enem)? mes_atual - mes_enem : mes_enem - mes_atual


export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col py-5 px-3">
      <div className="px-3 mb-6">
        <Logo size="sm" />
      </div>

      {SECTIONS.map((section) => (
        <div key={section.label} className="mb-2">
          <p className="px-3 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            {section.label}
          </p>
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
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium font-sora transition-all duration-150",
                  isActive
                    ? "bg-brand-50 text-brand-500"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                )}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}

      {/* Prova badge at bottom */}
      <div className="mt-auto px-3">
        <div className="bg-brand-50 rounded-xl p-3">
          <p className="text-[10px] font-semibold text-brand-400 uppercase tracking-wider mb-1">
            Preparando para
          </p>
          <p className="font-sora font-bold text-brand-600 text-sm">ENEM 2027</p>
          <p className="text-[11px] text-brand-400 mt-0.5">{dias_para_enem} dias e  {mes_para_enem} meses restantes</p>
        </div>
      </div>
    </aside>
  );
}
