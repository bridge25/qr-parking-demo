const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 신규 등록용 QR 코드 (미등록 상태)
  await prisma.qRCode.upsert({
    where: { shortId: 'J6UQDV' },
    update: {},
    create: {
      shortId: 'J6UQDV',
      status: 'UNREGISTERED',
    },
  });

  // 이미 등록된 차량 QR 코드
  const registeredQR = await prisma.qRCode.upsert({
    where: { shortId: 'R5Q7UD' },
    update: { status: 'REGISTERED' },
    create: {
      shortId: 'R5Q7UD',
      status: 'REGISTERED',
    },
  });

  // 등록된 차량 정보
  const hashedPassword = await bcrypt.hash('1234', 10);
  await prisma.vehicle.upsert({
    where: { qrCodeId: registeredQR.id },
    update: {},
    create: {
      qrCodeId: registeredQR.id,
      phoneNumber: '01012345678',
      vehicleNumber: '12가1234',
      safeNumber: '050-8940-3626',
      password: hashedPassword,
    },
  });

  // 추가 테스트 QR 코드들
  const testCodes = ['ABC123', 'XYZ789', 'QWE456'];
  for (const code of testCodes) {
    await prisma.qRCode.upsert({
      where: { shortId: code },
      update: {},
      create: {
        shortId: code,
        status: 'UNREGISTERED',
      },
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
