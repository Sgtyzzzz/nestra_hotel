import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Seed Kamar
  const superior = await prisma.room.upsert({
    where: { slug: 'superior' },
    update: {},
    create: {
      slug: 'superior',
      name: 'Kamar Superior',
      category: 'Kenyamanan Harian',
      description:
        'Ruang tenang bernuansa kayu hangat dengan pencahayaan alami, ideal untuk pelancong solo maupun pasangan.',
      sizeSqm: 26,
      bedType: '1 Ranjang Queen atau 2 Twin',
      maxGuests: 2,
      basePrice: 650000,
      totalUnits: 8,
      images: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
      ],
      amenities: ['Wi-Fi Cepat', 'AC', 'Smart TV 43"', 'Sarapan 2 Orang', 'Pembuat Kopi & Teh'],
    },
  });

  const deluks = await prisma.room.upsert({
    where: { slug: 'deluks' },
    update: {},
    create: {
      slug: 'deluks',
      name: 'Kamar Deluks',
      category: 'Pilihan Favorit',
      description:
        'Kamar lebih lega menghadap taman tropis dengan area duduk santai dan balkon pribadi.',
      sizeSqm: 34,
      bedType: '1 Ranjang King',
      maxGuests: 2,
      basePrice: 850000,
      totalUnits: 6,
      images: [
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80',
      ],
      amenities: ['Wi-Fi Cepat', 'Balkon Taman', 'Smart TV 50"', 'Sarapan 2 Orang', 'Bathtub & Rain Shower'],
    },
  });

  await prisma.room.upsert({
    where: { slug: 'family-suite' },
    update: {},
    create: {
      slug: 'family-suite',
      name: 'Family Suite',
      category: 'Keluarga & Rombongan',
      description:
        'Suite luas dengan ruang keluarga terpisah yang dirancang untuk kebersamaan tanpa kehilangan privasi.',
      sizeSqm: 52,
      bedType: '1 Ranjang King + 2 Ranjang Twin',
      maxGuests: 4,
      basePrice: 1350000,
      totalUnits: 3,
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80',
      ],
      amenities: ['Ruang Tamu Terpisah', 'Sarapan 4 Orang', 'Smart TV 55"', 'Mini Bar Gratis', 'Akses Kolam Langsung'],
    },
  });

  // 2. Seed Promo
  await prisma.promo.upsert({
    where: { code: 'NESTRALAMA' },
    update: {},
    create: {
      code: 'NESTRALAMA',
      title: 'Menginap Lebih Lama di Yogyakarta',
      description: 'Diskon 20% untuk pemesanan minimal 3 malam berturut-turut.',
      discountPercent: 20,
      minNights: 3,
      validUntil: new Date('2026-12-20T23:59:59Z'),
    },
  });

  await prisma.promo.upsert({
    where: { code: 'AWAL15' },
    update: {},
    create: {
      code: 'AWAL15',
      title: 'Rencana Matang, Harga Lebih Tenang',
      description: 'Potongan langsung 15% untuk pemesanan lebih awal.',
      discountPercent: 15,
      minNights: 1,
      validUntil: new Date('2026-12-31T23:59:59Z'),
    },
  });

  // 3. Seed Contoh Reservasi Aditya Pratama (sesuai desain Reservasi Saya)
  await prisma.booking.upsert({
    where: { bookingCode: 'NST-261016-0842' },
    update: {},
    create: {
      bookingCode: 'NST-261016-0842',
      roomId: deluks.id,
      guestFirstName: 'Aditya',
      guestLastName: 'Pratama',
      guestEmail: 'aditya.pratama@email.id',
      guestPhone: '+62 812 3456 7890',
      arrivalTime: '14.00–15.00 WIB',
      specialRequest: 'Kamar di lantai atas dan jauh dari lift, jika tersedia.',
      checkIn: new Date('2026-10-16T14:00:00Z'),
      checkOut: new Date('2026-10-18T12:00:00Z'),
      nights: 2,
      adults: 2,
      roomSubtotal: 1700000,
      discountAmount: 0,
      taxAmount: 187000,
      totalAmount: 1887000,
      status: 'UPCOMING',
      paymentStatus: 'PAID',
      paymentMethod: 'BCA Virtual Account',
      paymentRef: 'BCA-071026-0842',
      paidAt: new Date('2026-10-07T03:21:00Z'),
    },
  });

  console.log('Seeding Nestra Hotel selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });