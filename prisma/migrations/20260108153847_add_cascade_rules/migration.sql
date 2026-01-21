-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AccountPayable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rentalId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "beneficiaryName" TEXT NOT NULL,
    "beneficiaryDni" TEXT,
    "amount" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AccountPayable_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "Rental" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AccountPayable" ("amount", "beneficiaryDni", "beneficiaryName", "createdAt", "date", "id", "rentalId", "status", "type", "updatedAt") SELECT "amount", "beneficiaryDni", "beneficiaryName", "createdAt", "date", "id", "rentalId", "status", "type", "updatedAt" FROM "AccountPayable";
DROP TABLE "AccountPayable";
ALTER TABLE "new_AccountPayable" RENAME TO "AccountPayable";
CREATE TABLE "new_Maintenance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "cost" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "type" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Maintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Maintenance" ("cost", "createdAt", "date", "description", "id", "status", "type", "updatedAt", "vehicleId") SELECT "cost", "createdAt", "date", "description", "id", "status", "type", "updatedAt", "vehicleId" FROM "Maintenance";
DROP TABLE "Maintenance";
ALTER TABLE "new_Maintenance" RENAME TO "Maintenance";
CREATE TABLE "new_Rental" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "originalEndDate" DATETIME,
    "dailyRate" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "totalAmount" INTEGER,
    "commercialAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Rental_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Rental_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Rental" ("clientId", "commercialAgent", "createdAt", "dailyRate", "endDate", "id", "originalEndDate", "startDate", "status", "totalAmount", "updatedAt", "vehicleId") SELECT "clientId", "commercialAgent", "createdAt", "dailyRate", "endDate", "id", "originalEndDate", "startDate", "status", "totalAmount", "updatedAt", "vehicleId" FROM "Rental";
DROP TABLE "Rental";
ALTER TABLE "new_Rental" RENAME TO "Rental";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
