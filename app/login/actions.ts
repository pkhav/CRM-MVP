"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";
import { ensureDemoData } from "@/lib/crm-db";
import { prisma } from "@/lib/prisma";

export async function login(formData: FormData) {
  await ensureDemoData();

  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    redirect("/login?error=invalid");
  }

  await createSession(user.id);
  redirect(`/dashboard/${user.businessId}`);
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
