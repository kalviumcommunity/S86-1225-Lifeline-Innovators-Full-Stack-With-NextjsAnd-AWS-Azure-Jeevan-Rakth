import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface PlaceOrderInput {
  userId: number;
  productId: number;
  quantity?: number;
  paymentProvider?: string;
  paymentReference?: string;
  simulateFailure?: boolean;
}

export async function placeOrderTransaction({
  userId,
  productId,
  quantity = 1,
  paymentProvider = "INTERNAL_LEDGER",
  paymentReference,
  simulateFailure = false,
}: PlaceOrderInput) {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { id: true, stock: true, price: true },
    });

    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    if (product.stock < quantity) throw new Error("INSUFFICIENT_STOCK");

    const total = product.price * quantity;

    const order = await tx.order.create({
      data: {
        userId,
        productId,
        quantity,
        total,
        status: "PLACED",
      },
      select: { id: true, status: true, total: true, createdAt: true },
    });

    await tx.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });

    const payment = await tx.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        provider: paymentProvider,
        reference:
          paymentReference ?? `auto-${order.id}-${Date.now().toString(36)}`,
        status: "CAPTURED",
      },
      select: { id: true, status: true },
    });

    if (simulateFailure) throw new Error("ROLLBACK_TEST");

    return { order, payment };
  });
}
