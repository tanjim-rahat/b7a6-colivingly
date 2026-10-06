import Stripe from "stripe";
import config from "../../config/index.js";
import { prisma } from "../../lib/prisma.js";
import { PaymentStatus } from "../../../generated/prisma/client.js";

const stripe = new Stripe(config.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia" as any,
});

export interface CreateCheckoutSessionInput {
  tenantId: string;
  invoiceId: string;
}

export const createCheckoutSession = async ({
  tenantId,
  invoiceId,
}: CreateCheckoutSessionInput) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { tenant: true, application: { include: { room: true } } },
  });

  if (!invoice) throw new Error("Invoice not found");
  if (invoice.tenantId !== tenantId)
    throw new Error("Unauthorized to pay this invoice");
  if (invoice.status === PaymentStatus.SUCCEEDED)
    throw new Error("Invoice already paid");

  let customerId = invoice.tenant.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: invoice.tenant.email,
      metadata: { userId: tenantId, invoiceId },
    });
    customerId = customer.id;

    await prisma.user.update({
      where: { id: tenantId },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(invoice.amount * 100),
          product_data: {
            name: `Invoice ${invoiceId.slice(-6)}`,
            description: `Payment for invoice due ${invoice.dueDate.toISOString().slice(0, 10)}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { invoiceId, tenantId },
    success_url: `${config.SERVER_URL ?? "http://localhost:3000"}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.SERVER_URL ?? "http://localhost:3000"}/payment/cancel`,
  });

  return session;
};

export const handleWebhookEvent = async (
  payload: string,
  signature: string,
): Promise<{ eventType: string; data: unknown }> => {
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    config.STRIPE_WEBHOOK_SECRET!,
  );

  return { eventType: event.type, data: event.data.object };
};

export const updateInvoiceFromWebhook = async (
  paymentIntentId: string,
  status: string,
) => {
  const invoice = await prisma.invoice.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
    include: { application: { include: { room: true } } },
  });

  if (invoice) {
    const prismaStatus =
      status === "succeeded"
        ? PaymentStatus.SUCCEEDED
        : status === "failed"
          ? PaymentStatus.FAILED
          : invoice.status;

    const updateData: any = {
      status: prismaStatus,
      ...(status === "succeeded"
        ? { stripePaymentIntentId: paymentIntentId }
        : {}),
    };

    if (status === "succeeded" && invoice.applicationId) {
      updateData._addTenantToRoom = true;
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.invoice.update({
        where: { id: invoice.id },
        data: updateData,
        include: { application: { include: { room: true } } },
      });

      if (updateData._addTenantToRoom && updated.application) {
        const room = updated.application.room;
        const existingMember = await tx.room.findFirst({
          where: { id: room.id, tenants: { some: { id: invoice.tenantId } } },
        });

        if (!existingMember) {
          await tx.room.update({
            where: { id: room.id },
            data: { tenants: { connect: { id: invoice.tenantId } } },
          });
        }
      }

      return updated;
    });
  }

  // Fallback: find invoice via PaymentIntent metadata
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
  const invoiceId = pi.metadata?.invoiceId;
  if (!invoiceId) return null;

  const targetInvoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { application: { include: { room: true } } },
  });
  if (!targetInvoice) return null;

  const prismaStatus =
    status === "succeeded"
      ? PaymentStatus.SUCCEEDED
      : status === "failed"
        ? PaymentStatus.FAILED
        : targetInvoice.status;

  const updateData: any = {
    status: prismaStatus,
    ...(status === "succeeded"
      ? { stripePaymentIntentId: paymentIntentId }
      : {}),
  };

  if (status === "succeeded" && targetInvoice.applicationId) {
    updateData._addTenantToRoom = true;
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.invoice.update({
      where: { id: invoiceId },
      data: updateData,
      include: { application: { include: { room: true } } },
    });

    if (updateData._addTenantToRoom && updated.application) {
      const room = updated.application.room;
      const existingMember = await tx.room.findFirst({
        where: { id: room.id, tenants: { some: { id: updated.tenantId } } },
      });

      if (!existingMember) {
        await tx.room.update({
          where: { id: room.id },
          data: { tenants: { connect: { id: updated.tenantId } } },
        });
      }
    }

    return updated;
  });
};
