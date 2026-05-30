-- CreateTable
CREATE TABLE "IssueWatch" (
    "issueId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssueWatch_pkey" PRIMARY KEY ("issueId","userId")
);

-- CreateIndex
CREATE INDEX "IssueWatch_issueId_idx" ON "IssueWatch"("issueId");

-- AddForeignKey
ALTER TABLE "IssueWatch" ADD CONSTRAINT "IssueWatch_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueWatch" ADD CONSTRAINT "IssueWatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
