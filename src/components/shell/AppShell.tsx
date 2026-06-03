import { TopNav } from "./TopNav";
import { MobileNav } from "./MobileNav";
import { getSession } from "@/lib/session";
import { aiEnabled } from "@/lib/ai";
import { getCurrentLeague, getLeagues } from "@/lib/poe2scout";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const ai = aiEnabled();
  const [leagueInfo, leagues] = await Promise.all([
    getCurrentLeague().catch(() => null),
    getLeagues().catch(() => [] as Awaited<ReturnType<typeof getLeagues>>),
  ]);

  return (
    <>
      <div aria-hidden className="atmosphere" />
      <div aria-hidden className="grain" />
      <div className="relative z-0 min-h-screen">
        <TopNav
          account={session.account}
          character={session.character}
          aiEnabled={ai}
          league={leagueInfo?.value ?? ""}
          leagues={leagues}
        />
        <MobileNav account={session.account} aiEnabled={ai} />
        <main className="mx-auto w-full max-w-[1520px] px-5 py-7 sm:px-8">{children}</main>
        <footer className="mx-auto w-full max-w-[1520px] px-5 pb-10 pt-2 sm:px-8">
          <div className="mb-3 rule" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="mono text-[10px] leading-relaxed text-bone-700">
              Not affiliated with or endorsed by Grinding Gear Games. Path of Exile and Path of Exile 2 are
              trademarks of Grinding Gear Games. Price data from poe2scout.
            </p>
            <a
              href="https://github.com/aurph"
              target="_blank"
              rel="noreferrer"
              className="mono shrink-0 text-[10px] text-bone-700 transition-colors hover:text-gold-400"
            >
              Built by Jack Schwartz (aurph)
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
