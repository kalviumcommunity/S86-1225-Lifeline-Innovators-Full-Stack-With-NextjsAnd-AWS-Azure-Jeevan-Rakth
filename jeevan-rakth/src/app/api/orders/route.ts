import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { placeOrderTransaction } from "@/prisma/transactions";

const MAX_PAGE_SIZE = 50;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const skip = Number(searchParams.get("skip") ?? "0");
    const requestedTake = Number(searchParams.get("take") ?? "10");
    const take = Math.min(Math.max(requestedTake, 1), MAX_PAGE_SIZE);
    const status = searchParams.get("status") ?? undefined;
    const userIdParam = searchParams.get("userId");
    const userId = userIdParam ? Number(userIdParam) : undefined;

    const where = {
      ...(status ? { status } : {}),
      ...(userId ? { userId } : {}),
    };

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          quantity: true,
          total: true,
          createdAt: true,
          product: { select: { id: true, name: true, sku: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ data: orders, meta: { skip, take, total } });
  } catch (error) {
    console.error("Failed to list orders:", error);
    return NextResponse.json(
      { message: "Unable to fetch orders at this time." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      productId,
      quantity,
      paymentProvider,
      paymentReference,
      simulateFailure,
    } = body;

    if (!userId || !productId) {
      return NextResponse.json(
        { message: "userId and productId are required." },
        { status: 400 }
      );
    }

    if (quantity && quantity < 1) {
      return NextResponse.json(
        { message: "Quantity must be at least 1." },
        { status: 400 }
      );
    }

    const result = await placeOrderTransaction({
      userId,
      productId,
      quantity,
      paymentProvider,
      paymentReference,
      simulateFailure,
    });

    return NextResponse.json(
      { message: "Order placed successfully", ...result },
      { status: 201 }
    );
  } catch (error) {
    console.error("Transaction failed:", error);

    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
      return NextResponse.json(
        { message: "Insufficient product inventory." },
        { status: 409 }
      );
    }
    if (error instanceof Error && error.message === "ROLLBACK_TEST") {
      return NextResponse.json(
        {
          message:
            "Transaction rolled back as requested. No data was persisted.",
        },
        { status: 418 }
      );
    }

    return NextResponse.json(
      { message: "Order failed, changes rolled back." },
      { status: 500 }
    );
  }
}
