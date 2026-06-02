import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { getSession } from "@/lib/session";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <>
      <div aria-hidden className="atmosphere" />
      <div aria-hidden className="grain" />
      <div className="relative z-0 min-h-screen">
        <Sidebar account={session.account} character={session.character} />
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
