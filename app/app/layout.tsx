import { Sidebar } from "@/components/Sidebar";
import { AppTopBar } from "@/components/AppTopBar";

export const metadata = {
  title: "Workspace",
  description: "Find your next open-source issue."
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <AppTopBar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
