import AntragClient from "./AntragClient";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ amount?: string; months?: string }>;
}) {
  const params = await searchParams;
  const amount = params.amount ? Number(params.amount) : undefined;
  const months = params.months ? Number(params.months) : undefined;

  return (
    <AntragClient
      initialAmount={Number.isFinite(amount) ? amount : undefined}
      initialMonths={Number.isFinite(months) ? months : undefined}
    />
  );
}
