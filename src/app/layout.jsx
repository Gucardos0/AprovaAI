import "./globals.css";

export const metadata = {
  title: "AprovaAI — Preparação Inteligente para Vestibulares",
  description:
    "Plataforma de IA para ENEM, FUVEST, ETEC e outros vestibulares. Plano personalizado, exercícios adaptativos e correção de redação com inteligência artificial.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
