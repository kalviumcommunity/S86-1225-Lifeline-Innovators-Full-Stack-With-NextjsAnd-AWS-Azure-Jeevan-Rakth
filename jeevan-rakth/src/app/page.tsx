import { prisma } from "../lib/prisma";

export default async function Home() {
  const users = await prisma.user.findMany();
  console.log("Users from Prisma:", users);

  return (
    <main>
      <h1>Prisma Connection Successful</h1>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </main>
  );
}
