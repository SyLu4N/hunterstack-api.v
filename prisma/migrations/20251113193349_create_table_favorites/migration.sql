-- CreateTable
CREATE TABLE "favorites" (
    "userId" TEXT NOT NULL,
    "policyId" INTEGER NOT NULL,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("userId","policyId")
);

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "policies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
