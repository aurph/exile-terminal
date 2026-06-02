import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div aria-hidden className="atmosphere" />
      <div aria-hidden className="grain" />
      <div className="relative z-0 min-h-screen">
        <Sidebar />
        <div className="lg:pl-[264px]">
          <Topbar />
          <main className="mx-auto w-full max-w-[1520px] px-5 py-7 sm:px-8">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
