import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({
    include: {
      owner: true,
      team: true,
    },
  });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const body = await req.json();

  const project = await prisma.project.create({
    data: {
      name: body.name,
      code: body.code,
      ownerId: body.ownerId,
      teamId: body.teamId,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
