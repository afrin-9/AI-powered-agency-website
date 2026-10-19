-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "AiSource" AS ENUM ('LLM', 'FALLBACK');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CREATED', 'STATUS_CHANGE', 'NOTE', 'ASSIGN', 'AI_TRIAGE');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "aiCategory" "Category",
ADD COLUMN     "aiDraftReply" TEXT,
ADD COLUMN     "aiScore" INTEGER,
ADD COLUMN     "aiSource" "AiSource",
ADD COLUMN     "aiSummary" TEXT,
ADD COLUMN     "aiTriagedAt" TIMESTAMP(3),
ADD COLUMN     "aiUrgency" "Urgency",
ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "estimatedMax" INTEGER,
ADD COLUMN     "estimatedMin" INTEGER,
ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "LeadActivity" ADD COLUMN     "type" "ActivityType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Lead_projectId_key" ON "Lead"("projectId");

-- CreateIndex
CREATE INDEX "Lead_aiScore_idx" ON "Lead"("aiScore");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

