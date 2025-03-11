-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WorkingHours" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dayOfWeek" TEXT NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "isWorkingDay" BOOLEAN NOT NULL DEFAULT true,
    "contactId" TEXT NOT NULL,
    CONSTRAINT "WorkingHours_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WorkingHours" ("closeTime", "contactId", "dayOfWeek", "id", "openTime") SELECT "closeTime", "contactId", "dayOfWeek", "id", "openTime" FROM "WorkingHours";
DROP TABLE "WorkingHours";
ALTER TABLE "new_WorkingHours" RENAME TO "WorkingHours";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
