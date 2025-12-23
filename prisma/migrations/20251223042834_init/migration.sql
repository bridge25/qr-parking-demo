-- CreateTable
CREATE TABLE "QRCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shortId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNREGISTERED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "qrCodeId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "safeNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "registeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vehicle_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QRCode" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "QRCode_shortId_key" ON "QRCode"("shortId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_qrCodeId_key" ON "Vehicle"("qrCodeId");
