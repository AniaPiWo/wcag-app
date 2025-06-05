-- CreateTable
CREATE TABLE "AuditRequest" (
    "id" STRING NOT NULL,
    "url" STRING NOT NULL,
    "name" STRING NOT NULL DEFAULT '',
    "email" STRING NOT NULL DEFAULT '',
    "status" STRING NOT NULL DEFAULT 'pending',
    "completedAt" TIMESTAMP(3),
    "totalIssuesCount" INT4 DEFAULT 0,
    "criticalCount" INT4 DEFAULT 0,
    "seriousCount" INT4 DEFAULT 0,
    "moderateCount" INT4 DEFAULT 0,
    "minorCount" INT4 DEFAULT 0,
    "passedRules" INT4 DEFAULT 0,
    "incompleteRules" INT4 DEFAULT 0,
    "timestamp" STRING,
    "violations" STRING,
    "aiAnalysis" STRING,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "errorMessage" STRING,

    CONSTRAINT "AuditRequest_pkey" PRIMARY KEY ("id")
);

