import { getSession } from "@/lib/session";
import { setAccount, clearAccount } from "@/app/actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SaveCodePanel } from "@/components/account/SaveCodePanel";

export const dynamic = "force-dynamic";

const inputClass =
  "mono w-full rounded-[5px] border border-gold-700/25 bg-ink-900/60 px-3 py-2.5 text-[13px] text-bone-100 placeholder:text-bone-600 transition-colors focus:border-gold-500/50 focus:outline-none";

export default async function AccountPage() {
  const s = await getSession();

  return (
    <div className="reveal">
      <PageHeader
        eyebrow="Account"
        title="Point the Terminal"
        sub="Aim it at any Path of Exile 2 account. Progress, tracker, and build stay in this browser, no login."
      />

      <Panel className="max-w-xl p-6">
        <form action={setAccount} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="eyebrow text-bone-500">Account name</span>
            <input name="account" defaultValue={s.account ?? ""} placeholder="e.g. aurph" className={inputClass} autoComplete="off" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="eyebrow text-bone-500">Main character (optional)</span>
            <input name="character" defaultValue={s.character ?? ""} placeholder="e.g. alangreenspan" className={inputClass} autoComplete="off" />
          </label>
          <button
            type="submit"
            className="mono mt-1 self-start rounded-[5px] border border-gold-600/40 bg-gold-500/15 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-gold-200 transition-colors hover:bg-gold-500/25"
          >
            {s.account ? "Update" : "Connect"}
          </button>
        </form>

        <p className="mono mt-5 text-[11px] leading-relaxed text-bone-600">
          For character gear and stats, the account&rsquo;s profile must be public (pathofexile.com privacy
          settings). Economy, uniques, and the Oracle work without an account.
        </p>

        {s.account && (
          <form action={clearAccount} className="mt-5 border-t border-gold-700/15 pt-4">
            <div className="mb-2 text-[12.5px] text-bone-400">
              Connected to <span className="text-gold-300">{s.account}</span>
              {s.character ? <> · <span className="t-unique">{s.character}</span></> : null}
            </div>
            <button
              type="submit"
              className="mono rounded-[5px] border border-blood-600/40 px-3 py-1.5 text-[10.5px] uppercase tracking-[0.14em] text-blood-400 transition-colors hover:bg-blood-600/15"
            >
              Disconnect
            </button>
          </form>
        )}
      </Panel>

      <SaveCodePanel />
    </div>
  );
}
