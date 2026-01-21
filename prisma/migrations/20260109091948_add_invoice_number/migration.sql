/*
  Warnings:

  - Added the required column `invoiceNumber` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "rentalId" TEXT,
    "clientId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paidAmount" INTEGER NOT NULL DEFAULT 0,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "rentalDetails" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("amount", "clientId", "createdAt", "date", "id", "paidAmount", "rentalDetails", "rentalId", "status", "updatedAt") SELECT "amount", "clientId", "createdAt", "date", "id", "paidAmount", "rentalDetails", "rentalId", "status", "updatedAt" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE UNIQUE INDEX "Invoice_rentalId_key" ON "Invoice"("rentalId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
