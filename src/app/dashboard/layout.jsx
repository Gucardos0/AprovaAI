import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
