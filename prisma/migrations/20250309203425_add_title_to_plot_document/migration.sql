/*
  Warnings:

  - Added the required column `title` to the `PlotDocument` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlotDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "plotId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlotDocument_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "Plot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlotDocument" ("createdAt", "id", "name", "plotId", "updatedAt", "url") SELECT "createdAt", "id", "name", "plotId", "updatedAt", "url" FROM "PlotDocument";
DROP TABLE "PlotDocument";
ALTER TABLE "new_PlotDocument" RENAME TO "PlotDocument";
CREATE INDEX "PlotDocument_plotId_idx" ON "PlotDocument"("plotId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
