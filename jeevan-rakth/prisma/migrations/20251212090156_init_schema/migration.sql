-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updated_at" DROP DEFAULT;
