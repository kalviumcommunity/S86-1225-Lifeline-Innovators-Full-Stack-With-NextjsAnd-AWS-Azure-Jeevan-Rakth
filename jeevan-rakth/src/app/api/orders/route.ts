import { prisma } from "@/lib/prisma";
import {
  ERROR_CODES,
  errorResponse,
  successResponse,
} from "@/lib/responseHandler";
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

    return successResponse(
      "Orders retrieved successfully",
      { orders },
      {
        meta: { skip, take, total },
      }
    );
  } catch (error) {
    console.error("Failed to list orders:", error);
    return errorResponse("Unable to fetch orders at this time.", {
      status: 500,
      code: ERROR_CODES.ORDERS_FETCH_FAILED,
    });
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
      return errorResponse("userId and productId are required.", {
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
      });
    }

    if (quantity && quantity < 1) {
      return errorResponse("Quantity must be at least 1.", {
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
      });
    }

    const result = await placeOrderTransaction({
      userId,
      productId,
      quantity,
      paymentProvider,
      paymentReference,
      simulateFailure,
    });

    return successResponse("Order placed successfully", result, {
      status: 201,
    });
  } catch (error) {
    console.error("Transaction failed:", error);

    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return errorResponse("Product not found.", {
        status: 404,
        code: ERROR_CODES.PRODUCT_NOT_FOUND,
      });
    }
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
      return errorResponse("Insufficient product inventory.", {
        status: 409,
        code: ERROR_CODES.INSUFFICIENT_STOCK,
      });
    }
    if (error instanceof Error && error.message === "ROLLBACK_TEST") {
      return errorResponse(
        "Transaction rolled back as requested. No data was persisted.",
        {
          status: 418,
          code: ERROR_CODES.ROLLBACK_TEST,
        }
      );
    }

    return errorResponse("Order failed, changes rolled back.", {
      status: 500,
      code: ERROR_CODES.ORDER_TRANSACTION_FAILED,
    });
  }
}
