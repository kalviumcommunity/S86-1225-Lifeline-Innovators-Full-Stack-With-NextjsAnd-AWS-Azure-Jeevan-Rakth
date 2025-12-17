import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const mukesh = await prisma.user.upsert({
    where: { email: "mukesh@gmail.com" },
    update: {},
    create: {
      name: "Mukesh",
      email: "mukesh@gmail.com",
    },
  });

  const maxxi = await prisma.user.upsert({
    where: { email: "maxxi@example.com" },
    update: {},
    create: {
      name: "maxxi Engineer",
      email: "maxxi@example.com",
    },
  });

  const team = await prisma.team.upsert({
    where: { name: "Rapid Responders" },
    update: {},
    create: {
      name: "Rapid Responders",
      owner: { connect: { id: mukesh.id } },
      members: {
        create: [
          { user: { connect: { id: mukesh.id } }, role: "owner" },
          { user: { connect: { id: maxxi.id } }, role: "responder" },
        ],
      },
    },
  });

  const project = await prisma.project.upsert({
    where: { code: "JR-HOSP-ALERT" },
    update: {
      summary: "Hospital alert routing automation",
    },
    create: {
      name: "Hospital Alert Automation",
      code: "JR-HOSP-ALERT",
      summary: "Automates triage requests from hospitals to responders.",
      owner: { connect: { id: mukesh.id } },
      team: { connect: { id: team.id } },
    },
  });

  await prisma.product.createMany({
    data: [
      {
        name: "Universal Donor Kit",
        sku: "JR-DONOR-KIT-01",
        price: 49.99,
        stock: 25,
      },
      {
        name: "Rapid Plasma Pack",
        sku: "JR-PLASMA-PACK-02",
        price: 79.49,
        stock: 15,
      },
      {
        name: "Platelet Preservation Unit",
        sku: "JR-PLATELET-03",
        price: 65.75,
        stock: 10,
      },
    ],
  });

  const intakeTask = await prisma.task.upsert({
    where: {
      projectId_title: {
        projectId: project.id,
        title: "Design intake workflow",
      },
    },
    update: {},
    create: {
      title: "Design intake workflow",
      description:
        "Outline forms and API payload shape for hospital submissions.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      project: { connect: { id: project.id } },
      assignee: { connect: { id: mukesh.id } },
      comments: {
        create: {
          body: "Align form fields with regulatory reporting requirements.",
          author: { connect: { id: mukesh.id } },
        },
      },
    },
  });

  await prisma.task.upsert({
    where: {
      projectId_title: {
        projectId: project.id,
        title: "Prototype responder dashboard",
      },
    },
    update: {},
    create: {
      title: "Prototype responder dashboard",
      description: "Realtime dashboard for donor responders on duty.",
      status: "BACKLOG",
      priority: "MEDIUM",
      project: { connect: { id: project.id } },
      assignee: { connect: { id: maxxi.id } },
      comments: {
        create: {
          body: "Use WebSocket updates from the notification service.",
          author: { connect: { id: maxxi.id } },
        },
      },
    },
  });

  const taskCount = await prisma.task.count({
    where: { projectId: project.id },
  });

  console.log(`Seeded ${taskCount} tasks for project ${project.code}`);
  console.log(`Intake task id: ${intakeTask.id}`);
  console.log("Product catalog ready for order workflows.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
