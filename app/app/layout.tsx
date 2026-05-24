import { Sidebar } from "@/components/Sidebar";
import { AppTopBar } from "@/components/AppTopBar";

export const metadata = {
  title: "Workspace",
  description: "Find your next open-source issue."
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-github">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col relative">
        <div className="absolute inset-0 bg-grid-dots opacity-30 pointer-events-none" />
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-ok/[0.04] blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-brand/[0.04] blur-[100px] pointer-events-none" />
        <AppTopBar />
        <div className="relative flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
