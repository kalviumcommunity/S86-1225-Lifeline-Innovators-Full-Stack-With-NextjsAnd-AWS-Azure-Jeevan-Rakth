import { userCreateSchema } from "@/lib/schemas/userSchema";
import { projectCreateSchema } from "@/lib/schemas/projectSchema";
import { orderCreateSchema } from "@/lib/schemas/orderSchema";
import { taskCreateSchema } from "@/lib/schemas/taskSchema";

type Result = {
  success: boolean;
  errors?: Array<{ field: string; message: string }>;
  data?: unknown;
};

type SchemaLike = {
  safeParse: (
    v: unknown
  ) =>
    | { success: true; data: unknown }
    | {
        success: false;
        error: {
          issues: Array<{ path: Array<string | number>; message: string }>;
        };
      };
};

function run(schema: SchemaLike, payload: unknown): Result {
  const parsed = schema.safeParse(payload);
  if (parsed.success) return { success: true, data: parsed.data };
  return {
    success: false,
    errors: parsed.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    })),
  };
}

const samples = [
  {
    name: "user-invalid",
    schema: userCreateSchema,
    payload: { name: "A", email: "bademail" },
  },
  {
    name: "user-valid",
    schema: userCreateSchema,
    payload: { name: "Alice", email: "alice@example.com" },
  },
  {
    name: "project-invalid",
    schema: projectCreateSchema,
    payload: { name: "P", code: "", ownerId: "x" },
  },
  {
    name: "project-valid",
    schema: projectCreateSchema,
    payload: { name: "Proj", code: "P001", ownerId: 1, teamId: 1 },
  },
  { name: "order-invalid", schema: orderCreateSchema, payload: { userId: 1 } },
  {
    name: "order-valid",
    schema: orderCreateSchema,
    payload: { userId: 1, productId: 2, quantity: 2 },
  },
  { name: "task-invalid", schema: taskCreateSchema, payload: { title: "" } },
  {
    name: "task-valid",
    schema: taskCreateSchema,
    payload: {
      title: "Do thing",
      status: "BACKLOG",
      priority: "LOW",
      projectId: 1,
      assigneeId: 1,
    },
  },
];

for (const s of samples) {
  const res = run(s.schema, s.payload);
  console.log("---", s.name, "---");
  console.log(JSON.stringify(res, null, 2));
}
