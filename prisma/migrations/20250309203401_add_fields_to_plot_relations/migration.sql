/*
  Warnings:

  - Added the required column `description` to the `PlotCommunication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `PlotCommunication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `PlotFeature` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `PlotFeature` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlotCommunication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "plotId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlotCommunication_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "Plot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlotCommunication" ("createdAt", "id", "name", "plotId", "updatedAt") SELECT "createdAt", "id", "name", "plotId", "updatedAt" FROM "PlotCommunication";
DROP TABLE "PlotCommunication";
ALTER TABLE "new_PlotCommunication" RENAME TO "PlotCommunication";
CREATE INDEX "PlotCommunication_plotId_idx" ON "PlotCommunication"("plotId");
CREATE TABLE "new_PlotFeature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "plotId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlotFeature_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "Plot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlotFeature" ("createdAt", "id", "name", "plotId", "updatedAt") SELECT "createdAt", "id", "name", "plotId", "updatedAt" FROM "PlotFeature";
DROP TABLE "PlotFeature";
ALTER TABLE "new_PlotFeature" RENAME TO "PlotFeature";
CREATE INDEX "PlotFeature_plotId_idx" ON "PlotFeature"("plotId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
