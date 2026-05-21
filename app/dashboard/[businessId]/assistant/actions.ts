"use server";

import { revalidatePath } from "next/cache";
import { requireBusinessAccess } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createAutomationRule(businessId: string, formData: FormData) {
  await requireBusinessAccess(businessId);

  await prisma.automationRule.create({
    data: {
      businessId,
      name: String(formData.get("name") ?? "New automation"),
      trigger: String(formData.get("trigger") ?? "new_lead_created"),
      channel: String(formData.get("channel") ?? "Text"),
      delayMinutes: Number(formData.get("delayMinutes") ?? 0),
      audience: String(formData.get("audience") ?? "New leads"),
      status: "active",
      message: String(formData.get("message") ?? ""),
      fallbackMessage: String(formData.get("fallbackMessage") ?? "") || null,
    },
  });

  revalidatePath(`/dashboard/${businessId}`);
  revalidatePath(`/dashboard/${businessId}/assistant`);
}

export async function updateAutomationStatus(businessId: string, ruleId: string, formData: FormData) {
  await requireBusinessAccess(businessId);

  await prisma.automationRule.update({
    where: { id: ruleId },
    data: { status: String(formData.get("status") ?? "active") },
  });

  revalidatePath(`/dashboard/${businessId}`);
  revalidatePath(`/dashboard/${businessId}/assistant`);
}

export async function queueTestMessage(businessId: string, ruleId: string) {
  await requireBusinessAccess(businessId);

  const rule = await prisma.automationRule.findFirst({
    where: { id: ruleId, businessId },
  });
  const lead = await prisma.lead.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });

  if (!rule) {
    return;
  }

  await prisma.queuedMessage.create({
    data: {
      businessId,
      ruleId: rule.id,
      leadId: lead?.id,
      channel: rule.channel,
      recipient: lead?.phone ?? lead?.email ?? "sample recipient",
      message: rule.message.replaceAll("{{firstName}}", lead?.firstName ?? "there"),
      scheduledAt: new Date(Date.now() + rule.delayMinutes * 60 * 1000),
    },
  });

  revalidatePath(`/dashboard/${businessId}/assistant`);
}
