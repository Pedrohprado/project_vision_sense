/*
  Warnings:

  - Added the required column `deviceId` to the `DataReadings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DataReadings" ADD COLUMN     "deviceId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "DataReadings" ADD CONSTRAINT "DataReadings_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("key") ON DELETE RESTRICT ON UPDATE CASCADE;
