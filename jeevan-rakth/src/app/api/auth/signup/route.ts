import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { signupSchema } from "@/lib/schemas/authSchema";
import {
  errorResponse,
  successResponse,
  ERROR_CODES,
} from "@/lib/responseHandler";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    const parsed = signupSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      return errorResponse("Validation Error", {
        status: 400,
        code: ERROR_CODES.VALIDATION_ERROR,
        details: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    // prevent duplicate email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse("Email already exists", {
        status: 409,
        code: ERROR_CODES.EMAIL_CONFLICT,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    };

    const res = successResponse(
      "Signup successful",
      { user: safeUser, token },
      { status: 201 }
    );
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    return res;
  } catch (error) {
    console.error("Signup error:", error);
    return errorResponse("Signup failed", { status: 500 });
  }
}
