import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
} from "@/lib/responseHandler";
import { loginSchema } from "@/lib/schemas/authSchema";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
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

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return errorResponse("User not found", {
        status: 404,
        code: ERROR_CODES.USER_NOT_FOUND,
      });

    if (!user.password)
      return errorResponse("Invalid credentials", { status: 401 });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return errorResponse("Invalid credentials", { status: 401 });

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role ?? "user",
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: "1h",
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role ?? "user",
    };

    const res = successResponse("Login successful", { user: safeUser, token });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("Login failed", { status: 500 });
  }
}
