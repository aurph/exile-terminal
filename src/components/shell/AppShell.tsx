import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";
import { getSession } from "@/lib/session";
import { aiEnabled } from "@/lib/ai";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const ai = aiEnabled();

  return (
    <>
      <div aria-hidden className="atmosphere" />
      <div aria-hidden className="grain" />
      <div className="relative z-0 min-h-screen">
        <Sidebar account={session.account} character={session.character} aiEnabled={ai} />
        <MobileNav account={session.account} aiEnabled={ai} />
        <div className="lg:pl-[264px]">
          <Topbar aiEnabled={ai} />
          <main className="mx-auto w-full max-w-[1520px] px-5 py-7 sm:px-8">{children}</main>
          <footer className="mx-auto w-full max-w-[1520px] px-5 pb-10 pt-2 sm:px-8">
            <div className="mb-3 rule" />
            <p className="mono text-[10px] leading-relaxed text-bone-700">
              Not affiliated with or endorsed by Grinding Gear Games. Path of Exile and Path of Exile 2 are
              trademarks of Grinding Gear Games. Price data from poe2scout.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
