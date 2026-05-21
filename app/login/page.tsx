import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ensureDemoData } from "@/lib/crm-db";
import { businesses } from "@/lib/mock-crm";
import { login } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await ensureDemoData();

  const user = await getCurrentUser();

  if (user) {
    redirect(`/dashboard/${user.businessId}`);
  }

  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">FitFlow CRM</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight">Sign in to your business workspace</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Secure sessions keep each business inside its own dashboard, funnels, lead pipeline, bookings, reviews, and social setup.
          </p>

          <form action={login} className="mt-8 rounded-lg border border-white/10 bg-white p-4 text-slate-950 shadow-sm sm:p-5">
            <h2 className="text-lg font-semibold">Owner login</h2>
            {error === "invalid" ? (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                The email or password was incorrect.
              </p>
            ) : null}
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Email
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                  name="email"
                  placeholder="jeffs-training@fitflow.local"
                  type="email"
                />
              </label>
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Password
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                  name="password"
                  placeholder="FitFlow2026!"
                  type="password"
                />
              </label>
              <button className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white" type="submit">
                Sign in
              </button>
            </div>
          </form>
        </section>

        <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
          {businesses.map((business) => (
            <div className={`rounded-lg border p-4 shadow-sm ${business.theme.card}`} key={business.id}>
              <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{business.theme.label}</span>
              <h2 className="mt-3 text-xl font-bold">{business.name}</h2>
              <p className="mt-2 text-sm leading-6 opacity-75">{business.owner}</p>
              <p className="mt-3 break-all rounded-md bg-white/70 px-2 py-1 text-xs font-semibold opacity-80">
                {business.id}@fitflow.local
              </p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
