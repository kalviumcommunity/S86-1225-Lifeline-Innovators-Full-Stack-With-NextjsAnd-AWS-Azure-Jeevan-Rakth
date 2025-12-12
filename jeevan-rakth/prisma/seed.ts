import { PrismaClient, TaskPriority, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed baseline users.
  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      name: "Alice ProjectLead",
      email: "alice@example.com",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      name: "Bob Engineer",
      email: "bob@example.com",
    },
  });

  // Seed team and memberships.
  const team = await prisma.team.upsert({
    where: { name: "Rapid Responders" },
    update: {},
    create: {
      name: "Rapid Responders",
      owner: { connect: { id: alice.id } },
      members: {
        create: [
          { user: { connect: { id: alice.id } }, role: "owner" },
          { user: { connect: { id: bob.id } }, role: "responder" },
        ],
      },
    },
  });

  // Seed project for team.
  const project = await prisma.project.upsert({
    where: { code: "JR-HOSP-ALERT" },
    update: {
      summary: "Hospital alert routing automation",
    },
    create: {
      name: "Hospital Alert Automation",
      code: "JR-HOSP-ALERT",
      summary: "Automates triage requests from hospitals to responders.",
      owner: { connect: { id: alice.id } },
      team: { connect: { id: team.id } },
    },
  });

  // Seed tasks with comments.
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
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      project: { connect: { id: project.id } },
      assignee: { connect: { id: alice.id } },
      comments: {
        create: {
          body: "Align form fields with regulatory reporting requirements.",
          author: { connect: { id: alice.id } },
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
      status: TaskStatus.BACKLOG,
      priority: TaskPriority.MEDIUM,
      project: { connect: { id: project.id } },
      assignee: { connect: { id: bob.id } },
      comments: {
        create: {
          body: "Use WebSocket updates from the notification service.",
          author: { connect: { id: bob.id } },
        },
      },
    },
  });

  // Provide simple output for verification.
  const taskCount = await prisma.task.count({
    where: { projectId: project.id },
  });
  console.log(`Seeded ${taskCount} tasks for project ${project.code}.`);
  console.log(`Intake task id: ${intakeTask.id}`);
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
