export default function AppLogo() {
  return (
    <>
      <div className="flex aspect-square size-8 items-center justify-center rounded-md">
        <img src="/logo_kabelota.png" alt="Logo Kabelota" className="size-8" />
      </div>
      <div className="ml-1 grid flex-1 text-left text-sm">
        <span className="mb-0.5 truncate leading-tight font-semibold">
          MEDPLAN ─ GOV
        </span>
        <span className="text-[10px]">RSUD KABELOTA DONGGALA</span>
      </div>
    </>
  );
}
