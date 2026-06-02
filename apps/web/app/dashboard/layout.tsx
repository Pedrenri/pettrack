import { ReactNode } from "react";
import DashboardNav from "./DashboardNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-gray-950 flex flex-col">
      <DashboardNav />
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
