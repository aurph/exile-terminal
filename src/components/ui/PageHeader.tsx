export function PageHeader({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="eyebrow mb-2">{eyebrow}</div>
        <h1 className="font-display text-2xl leading-none text-bone-100 sm:text-[30px]">
          {title}
        </h1>
        {sub && <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-bone-400">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
