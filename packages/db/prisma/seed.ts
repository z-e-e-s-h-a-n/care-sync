import "dotenv/config";
import argon2 from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  AppointmentCancellationSource,
  AppointmentChannel,
  AppointmentStatus,
  CampaignAudience,
  CampaignStatus,
  ConversationStatus,
  ConversationType,
  DoctorVerificationStatus,
  Gender,
  IdentificationType,
  MediaType,
  MediaVisibility,
  NotificationChannel,
  NotificationPurpose,
  NotificationStatus,
  OrderStatus,
  PaymentMethodType,
  PaymentProvider,
  PaymentStatus,
  PrismaClient,
  RefundStatus,
  ShipmentStatus,
  UserRole,
  UserStatus,
  Weekday,
} from "../prisma/generated/client";

const connectionString = process.env.DB_URI;

if (!connectionString) {
  throw new Error("DB_URI is required to run the Prisma seed.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const DEFAULT_PASSWORD = "Test@123456";
const DEFAULT_TIMEZONE = "Asia/Karachi";

const daysFromNow = (days: number, hour = 9, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const hoursAfter = (date: Date, hours: number, minutes = 0) =>
  new Date(date.getTime() + hours * 60 * 60 * 1000 + minutes * 60 * 1000);

async function clearDatabase() {
  console.log("Clearing existing seed data...");

  await prisma.messageAttachment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctorBlockedTime.deleteMany();
  await prisma.doctorAvailability.deleteMany();
  await prisma.campaignRecipient.deleteMany();
  await prisma.notificationCampaign.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.otp.deleteMany();
  await prisma.session.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.media.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.user.deleteMany();
}

async function seedFoundation() {
  console.log("Seeding branches, and users...");

  const hashedPassword = await argon2.hash(DEFAULT_PASSWORD);

  const downtownBranch = await prisma.branch.create({
    data: {
      name: "Downtown Branch",
      slug: "downtown",
      email: "downtown@caresync.test",
      phone: "+923001110001",
      address: "12 Main Boulevard, Downtown",
      timezone: DEFAULT_TIMEZONE,
      isActive: true,
    },
  });

  const northBranch = await prisma.branch.create({
    data: {
      name: "North Branch",
      slug: "north",
      email: "north@caresync.test",
      phone: "+923001110002",
      address: "44 North Avenue, City Center",
      timezone: DEFAULT_TIMEZONE,
      isActive: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      firstName: "System",
      lastName: "Admin",
      displayName: "System Admin",
      email: "admin@example.com",
      phone: "+15550000001",
      password: hashedPassword,
      role: UserRole.admin,
      status: UserStatus.active,
      isEmailVerified: true,
      isPhoneVerified: true,
      pushNotifications: true,
      loginAlerts: true,
    },
  });

  const doctorUser1 = await prisma.user.create({
    data: {
      firstName: "John",
      lastName: "Smith",
      displayName: "Dr. John Smith",
      email: "dr.smith@example.com",
      phone: "+15550000011",
      password: hashedPassword,
      role: UserRole.doctor,
      status: UserStatus.active,
      isEmailVerified: true,
      isPhoneVerified: true,
      pushNotifications: true,
    },
  });

  const doctorUser2 = await prisma.user.create({
    data: {
      firstName: "Emily",
      lastName: "Jones",
      displayName: "Dr. Emily Jones",
      email: "dr.jones@example.com",
      phone: "+15550000012",
      password: hashedPassword,
      role: UserRole.doctor,
      status: UserStatus.active,
      isEmailVerified: true,
      isPhoneVerified: true,
      pushNotifications: true,
    },
  });

  const doctorUser3 = await prisma.user.create({
    data: {
      firstName: "Sarah",
      lastName: "Khan",
      displayName: "Dr. Sarah Khan",
      email: "dr.pending@example.com",
      phone: "+15550000013",
      password: hashedPassword,
      role: UserRole.doctor,
      status: UserStatus.pending,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  const patientUser1 = await prisma.user.create({
    data: {
      firstName: "Alice",
      lastName: "Brown",
      displayName: "Alice Brown",
      email: "patient1@example.com",
      phone: "+15550000021",
      password: hashedPassword,
      role: UserRole.patient,
      status: UserStatus.active,
      isEmailVerified: true,
      isPhoneVerified: true,
      pushNotifications: true,
    },
  });

  const patientUser2 = await prisma.user.create({
    data: {
      firstName: "Bob",
      lastName: "Wilson",
      displayName: "Bob Wilson",
      email: "patient2@example.com",
      phone: "+15550000022",
      password: hashedPassword,
      role: UserRole.patient,
      status: UserStatus.active,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  const patientUser3 = await prisma.user.create({
    data: {
      firstName: "Nina",
      lastName: "Ahmed",
      displayName: "Nina Ahmed",
      email: "patient3@example.com",
      phone: "+15550000023",
      password: hashedPassword,
      role: UserRole.patient,
      status: UserStatus.active,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  return {
    downtownBranch,
    northBranch,
    admin,
    doctorUser1,
    doctorUser2,
    doctorUser3,
    patientUser1,
    patientUser2,
    patientUser3,
  };
}

async function seedMedia(users: Awaited<ReturnType<typeof seedFoundation>>) {
  console.log("Seeding media...");

  const adminAvatar = await prisma.media.create({
    data: {
      uploadedById: users.admin.id,
      publicId: "seed/admin-avatar",
      url: "https://images.example.com/admin-avatar.png",
      mimeType: "image/png",
      resourceType: "image",
      size: 1024,
      hash: "seed-admin-avatar-hash",
      name: "admin-avatar.png",
      type: MediaType.avatar,
      visibility: MediaVisibility.public,
      altText: "Admin avatar",
    },
  });

  const doctor1IdDoc = await prisma.media.create({
    data: {
      uploadedById: users.doctorUser1.id,
      publicId: "seed/doctor-1-id",
      url: "https://files.example.com/doctor-1-id.pdf",
      mimeType: "application/pdf",
      resourceType: "raw",
      size: 314572,
      hash: "seed-doctor-1-id-hash",
      name: "doctor-1-id.pdf",
      type: MediaType.document,
      visibility: MediaVisibility.private,
    },
  });

  const doctor1LicenseDoc = await prisma.media.create({
    data: {
      uploadedById: users.doctorUser1.id,
      publicId: "seed/doctor-1-license",
      url: "https://files.example.com/doctor-1-license.pdf",
      mimeType: "application/pdf",
      resourceType: "raw",
      size: 421000,
      hash: "seed-doctor-1-license-hash",
      name: "doctor-1-license.pdf",
      type: MediaType.document,
      visibility: MediaVisibility.private,
    },
  });

  const doctor2IdDoc = await prisma.media.create({
    data: {
      uploadedById: users.doctorUser2.id,
      publicId: "seed/doctor-2-id",
      url: "https://files.example.com/doctor-2-id.pdf",
      mimeType: "application/pdf",
      resourceType: "raw",
      size: 299120,
      hash: "seed-doctor-2-id-hash",
      name: "doctor-2-id.pdf",
      type: MediaType.document,
      visibility: MediaVisibility.private,
    },
  });

  const doctor2LicenseDoc = await prisma.media.create({
    data: {
      uploadedById: users.doctorUser2.id,
      publicId: "seed/doctor-2-license",
      url: "https://files.example.com/doctor-2-license.pdf",
      mimeType: "application/pdf",
      resourceType: "raw",
      size: 388450,
      hash: "seed-doctor-2-license-hash",
      name: "doctor-2-license.pdf",
      type: MediaType.document,
      visibility: MediaVisibility.private,
    },
  });

  const doctor3IdDoc = await prisma.media.create({
    data: {
      uploadedById: users.doctorUser3.id,
      publicId: "seed/doctor-3-id",
      url: "https://files.example.com/doctor-3-id.pdf",
      mimeType: "application/pdf",
      resourceType: "raw",
      size: 287000,
      hash: "seed-doctor-3-id-hash",
      name: "doctor-3-id.pdf",
      type: MediaType.document,
      visibility: MediaVisibility.private,
    },
  });

  const doctor3LicenseDoc = await prisma.media.create({
    data: {
      uploadedById: users.doctorUser3.id,
      publicId: "seed/doctor-3-license",
      url: "https://files.example.com/doctor-3-license.pdf",
      mimeType: "application/pdf",
      resourceType: "raw",
      size: 365200,
      hash: "seed-doctor-3-license-hash",
      name: "doctor-3-license.pdf",
      type: MediaType.document,
      visibility: MediaVisibility.private,
    },
  });

  const patient1IdDoc = await prisma.media.create({
    data: {
      uploadedById: users.patientUser1.id,
      publicId: "seed/patient-1-id",
      url: "https://files.example.com/patient-1-id.pdf",
      mimeType: "application/pdf",
      resourceType: "raw",
      size: 240100,
      hash: "seed-patient-1-id-hash",
      name: "patient-1-id.pdf",
      type: MediaType.document,
      visibility: MediaVisibility.private,
    },
  });

  const patient2IdDoc = await prisma.media.create({
    data: {
      uploadedById: users.patientUser2.id,
      publicId: "seed/patient-2-id",
      url: "https://files.example.com/patient-2-id.pdf",
      mimeType: "application/pdf",
      resourceType: "raw",
      size: 252900,
      hash: "seed-patient-2-id-hash",
      name: "patient-2-id.pdf",
      type: MediaType.document,
      visibility: MediaVisibility.private,
    },
  });

  const prescriptionImage = await prisma.media.create({
    data: {
      uploadedById: users.patientUser1.id,
      publicId: "seed/prescription-1",
      url: "https://files.example.com/prescription-1.jpg",
      mimeType: "image/jpeg",
      resourceType: "image",
      size: 180400,
      hash: "seed-prescription-1-hash",
      name: "prescription-1.jpg",
      type: MediaType.prescription,
      visibility: MediaVisibility.private,
    },
  });

  const vitaminImage = await prisma.media.create({
    data: {
      uploadedById: users.admin.id,
      publicId: "seed/product-vitamin-c",
      url: "https://images.example.com/products/vitamin-c.jpg",
      mimeType: "image/jpeg",
      resourceType: "image",
      size: 94212,
      hash: "seed-product-vitamin-c-hash",
      name: "vitamin-c.jpg",
      type: MediaType.product,
      visibility: MediaVisibility.public,
    },
  });

  const creamImage = await prisma.media.create({
    data: {
      uploadedById: users.admin.id,
      publicId: "seed/product-cream",
      url: "https://images.example.com/products/cream.jpg",
      mimeType: "image/jpeg",
      resourceType: "image",
      size: 90112,
      hash: "seed-product-cream-hash",
      name: "cream.jpg",
      type: MediaType.product,
      visibility: MediaVisibility.public,
    },
  });

  await prisma.user.update({
    where: { id: users.admin.id },
    data: { imageId: adminAvatar.id },
  });

  return {
    adminAvatar,
    doctor1IdDoc,
    doctor1LicenseDoc,
    doctor2IdDoc,
    doctor2LicenseDoc,
    doctor3IdDoc,
    doctor3LicenseDoc,
    patient1IdDoc,
    patient2IdDoc,
    prescriptionImage,
    vitaminImage,
    creamImage,
  };
}

async function seedProfiles(
  users: Awaited<ReturnType<typeof seedFoundation>>,
  media: Awaited<ReturnType<typeof seedMedia>>,
) {
  console.log("Seeding patient and doctor profiles...");

  const patient1 = await prisma.patientProfile.create({
    data: {
      userId: users.patientUser1.id,
      preferredBranchId: users.downtownBranch.id,
      identificationDocumentId: media.patient1IdDoc.id,
      birthDate: new Date("1992-04-12"),
      gender: Gender.female,
      address: "House 22, Garden Town, Lahore",
      occupation: "Teacher",
      emergencyContactName: "Jane Brown",
      emergencyContactNumber: "+15550000991",
      insuranceProvider: "HealthSecure",
      insurancePolicyNumber: "HS-12345-01",
      allergies: "Penicillin",
      currentMedication: "Albuterol inhaler",
      familyMedicalHistory: "Family history of asthma.",
      pastMedicalHistory: "Asthma during childhood.",
      identificationType: IdentificationType.passport,
      identificationNumber: "PAK-P1-8821",
    },
  });

  const patient2 = await prisma.patientProfile.create({
    data: {
      userId: users.patientUser2.id,
      preferredBranchId: users.northBranch.id,
      identificationDocumentId: media.patient2IdDoc.id,
      birthDate: new Date("1987-09-03"),
      gender: Gender.male,
      address: "Street 8, DHA, Karachi",
      occupation: "Software Engineer",
      emergencyContactName: "Sarah Wilson",
      emergencyContactNumber: "+15550000992",
      insuranceProvider: "LifeCare",
      insurancePolicyNumber: "LC-99128",
      allergies: "None reported",
      currentMedication: "Lisinopril",
      familyMedicalHistory: "Family history of hypertension.",
      pastMedicalHistory: "Mild hypertension.",
      identificationType: IdentificationType.nationalId,
      identificationNumber: "35202-5555555-1",
    },
  });

  const patient3 = await prisma.patientProfile.create({
    data: {
      userId: users.patientUser3.id,
      preferredBranchId: users.downtownBranch.id,
      address: "Unfinished profile testing user",
    },
  });

  const doctor1 = await prisma.doctorProfile.create({
    data: {
      userId: users.doctorUser1.id,
      branchId: users.downtownBranch.id,
      createdById: users.admin.id,
      verifiedById: users.admin.id,
      identificationDocumentId: media.doctor1IdDoc.id,
      licenseDocumentId: media.doctor1LicenseDoc.id,
      slug: "dr-john-smith",
      title: "Dr.",
      specialty: "Cardiology",
      bio: "Cardiologist focused on preventive heart care and hypertension management.",
      licenseNumber: "DOC-CARD-1001",
      yearsExperience: 15,
      education: "MBBS, FCPS Cardiology",
      qualifications:
        "Board-certified cardiologist with chronic care experience.",
      languages: ["English", "Urdu"],
      consultationFee: 8500,
      commissionPercent: 12.5,
      identificationType: IdentificationType.passport,
      identificationNumber: "DOC-SMITH-01",
      verificationStatus: DoctorVerificationStatus.verified,
      verifiedAt: new Date(),
      isAvailable: true,
    },
  });

  const doctor2 = await prisma.doctorProfile.create({
    data: {
      userId: users.doctorUser2.id,
      branchId: users.northBranch.id,
      createdById: users.admin.id,
      verifiedById: users.admin.id,
      identificationDocumentId: media.doctor2IdDoc.id,
      licenseDocumentId: media.doctor2LicenseDoc.id,
      slug: "dr-emily-jones",
      title: "Dr.",
      specialty: "Dermatology",
      bio: "Dermatologist specializing in acne, eczema, and skin allergy treatment.",
      licenseNumber: "DOC-DERM-2001",
      yearsExperience: 9,
      education: "MBBS, MCPS Dermatology",
      qualifications:
        "Clinic dermatologist with outpatient consultation experience.",
      languages: ["English", "Urdu"],
      consultationFee: 7000,
      commissionPercent: 10,
      identificationType: IdentificationType.driversLicense,
      identificationNumber: "DL-JONES-77",
      verificationStatus: DoctorVerificationStatus.verified,
      verifiedAt: new Date(),
      isAvailable: true,
    },
  });

  const doctor3 = await prisma.doctorProfile.create({
    data: {
      userId: users.doctorUser3.id,
      branchId: users.downtownBranch.id,
      createdById: users.doctorUser3.id,
      identificationDocumentId: media.doctor3IdDoc.id,
      licenseDocumentId: media.doctor3LicenseDoc.id,
      title: "Dr.",
      specialty: "General Medicine",
      bio: "Pending verification doctor for admin workflow testing.",
      licenseNumber: "DOC-GEN-3001",
      yearsExperience: 4,
      education: "MBBS",
      qualifications: "General practitioner.",
      languages: ["English", "Urdu"],
      consultationFee: 5000,
      commissionPercent: 12.5,
      identificationType: IdentificationType.nationalId,
      identificationNumber: "42101-1111111-3",
      verificationStatus: DoctorVerificationStatus.pending,
      isAvailable: false,
    },
  });

  return { patient1, patient2, patient3, doctor1, doctor2, doctor3 };
}

async function seedAvailability(
  profiles: Awaited<ReturnType<typeof seedProfiles>>,
) {
  console.log("Seeding doctor availability...");

  const weekdays = [
    Weekday.monday,
    Weekday.tuesday,
    Weekday.wednesday,
    Weekday.thursday,
    Weekday.friday,
  ];

  for (const weekday of weekdays) {
    await prisma.doctorAvailability.create({
      data: {
        doctorId: profiles.doctor1.id,
        weekday,
        startTime: "09:00",
        endTime: "13:00",
        slotDurationMinute: 30,
        isActive: true,
      },
    });

    await prisma.doctorAvailability.create({
      data: {
        doctorId: profiles.doctor2.id,
        weekday,
        startTime: "14:00",
        endTime: "18:00",
        slotDurationMinute: 30,
        isActive: true,
      },
    });
  }

  await prisma.doctorBlockedTime.create({
    data: {
      doctorId: profiles.doctor1.id,
      startAt: daysFromNow(3, 10, 0),
      endAt: daysFromNow(3, 12, 0),
      reason: "Conference block for availability testing",
    },
  });
}

async function seedAppointments(
  foundation: Awaited<ReturnType<typeof seedFoundation>>,
  profiles: Awaited<ReturnType<typeof seedProfiles>>,
) {
  console.log("Seeding appointments...");

  const bookedStart = daysFromNow(1, 10, 0);
  const confirmedStart = daysFromNow(2, 15, 0);
  const completedStart = daysFromNow(-4, 11, 0);
  const cancelledStart = daysFromNow(5, 9, 30);

  const appointment1 = await prisma.appointment.create({
    data: {
      appointmentNumber: "APT-1001",
      branchId: foundation.downtownBranch.id,
      patientId: profiles.patient1.id,
      doctorId: profiles.doctor1.id,
      createdById: foundation.patientUser1.id,
      status: AppointmentStatus.booked,
      bookingSource: "app",
      channel: AppointmentChannel.inPerson,
      paymentStatus: PaymentStatus.pending,
      scheduledStartAt: bookedStart,
      scheduledEndAt: hoursAfter(bookedStart, 0, 30),
      timezone: DEFAULT_TIMEZONE,
      patientNotes: "Occasional chest discomfort after exercise.",
    },
  });

  const appointment2 = await prisma.appointment.create({
    data: {
      appointmentNumber: "APT-1002",
      branchId: foundation.northBranch.id,
      patientId: profiles.patient2.id,
      doctorId: profiles.doctor2.id,
      createdById: foundation.admin.id,
      status: AppointmentStatus.confirmed,
      bookingSource: "admin",
      channel: AppointmentChannel.inPerson,
      paymentStatus: PaymentStatus.succeeded,
      scheduledStartAt: confirmedStart,
      scheduledEndAt: hoursAfter(confirmedStart, 0, 30),
      timezone: DEFAULT_TIMEZONE,
      patientNotes: "Recurring skin rash on forearm.",
      confirmedAt: new Date(),
      paidAt: new Date(),
    },
  });

  const appointment3 = await prisma.appointment.create({
    data: {
      appointmentNumber: "APT-1003",
      branchId: foundation.northBranch.id,
      patientId: profiles.patient1.id,
      doctorId: profiles.doctor2.id,
      createdById: foundation.patientUser1.id,
      status: AppointmentStatus.completed,
      bookingSource: "app",
      channel: AppointmentChannel.virtual,
      paymentStatus: PaymentStatus.refunded,
      scheduledStartAt: completedStart,
      scheduledEndAt: hoursAfter(completedStart, 0, 30),
      timezone: DEFAULT_TIMEZONE,
      patientNotes: "Follow-up for eczema treatment plan.",
      doctorNotes: "Continue current moisturizer and review in four weeks.",
      confirmedAt: hoursAfter(completedStart, -24),
      completedAt: hoursAfter(completedStart, 0, 30),
      paidAt: hoursAfter(completedStart, -36),
    },
  });

  const appointment4 = await prisma.appointment.create({
    data: {
      appointmentNumber: "APT-1004",
      branchId: foundation.downtownBranch.id,
      patientId: profiles.patient2.id,
      doctorId: profiles.doctor1.id,
      createdById: foundation.patientUser2.id,
      status: AppointmentStatus.cancelled,
      cancellationSource: AppointmentCancellationSource.patient,
      bookingSource: "app",
      channel: AppointmentChannel.inPerson,
      paymentStatus: PaymentStatus.failed,
      scheduledStartAt: cancelledStart,
      scheduledEndAt: hoursAfter(cancelledStart, 0, 30),
      timezone: DEFAULT_TIMEZONE,
      patientNotes: "Booked for blood pressure review.",
      cancellationReason: "Patient requested a new date.",
      cancelledAt: new Date(),
      adminNotes: "Keep slot open for rebooking tests.",
    },
  });

  return { appointment1, appointment2, appointment3, appointment4 };
}

async function seedConversations(
  foundation: Awaited<ReturnType<typeof seedFoundation>>,
  profiles: Awaited<ReturnType<typeof seedProfiles>>,
  appointments: Awaited<ReturnType<typeof seedAppointments>>,
  media: Awaited<ReturnType<typeof seedMedia>>,
) {
  console.log("Seeding conversations and messages...");

  const appointmentConversation = await prisma.conversation.create({
    data: {
      branchId: foundation.downtownBranch.id,
      patientId: profiles.patient1.id,
      appointmentId: appointments.appointment1.id,
      assignedToId: foundation.doctorUser1.id,
      type: ConversationType.appointment,
      status: ConversationStatus.open,
      subject: "Appointment follow-up questions",
      lastMessageAt: new Date(),
    },
  });

  const patientMessage = await prisma.message.create({
    data: {
      conversationId: appointmentConversation.id,
      senderId: foundation.patientUser1.id,
      body: "Hello doctor, should I bring my previous test reports to the visit?",
    },
  });

  await prisma.message.create({
    data: {
      conversationId: appointmentConversation.id,
      senderId: foundation.doctorUser1.id,
      body: "Yes, please bring any ECG or blood pressure reports you already have.",
    },
  });

  await prisma.messageAttachment.create({
    data: {
      messageId: patientMessage.id,
      mediaId: media.prescriptionImage.id,
    },
  });

  const supportConversation = await prisma.conversation.create({
    data: {
      branchId: foundation.northBranch.id,
      patientId: profiles.patient2.id,
      assignedToId: foundation.admin.id,
      type: ConversationType.support,
      status: ConversationStatus.open,
      subject: "Need help with order tracking",
      lastMessageAt: new Date(),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: supportConversation.id,
        senderId: foundation.patientUser2.id,
        body: "I want to confirm when my skincare order will arrive.",
      },
      {
        conversationId: supportConversation.id,
        senderId: foundation.admin.id,
        body: "Our team has marked it as shipped and shared the tracking number in your order.",
      },
    ],
  });
}

async function seedCommerce(
  foundation: Awaited<ReturnType<typeof seedFoundation>>,
  profiles: Awaited<ReturnType<typeof seedProfiles>>,
  media: Awaited<ReturnType<typeof seedMedia>>,
) {
  console.log("Seeding commerce data...");

  const supplementsCategory = await prisma.productCategory.create({
    data: {
      name: "Supplements",
      slug: "supplements",
      description: "General wellness and immune support supplements.",
      isActive: true,
    },
  });

  const skincareCategory = await prisma.productCategory.create({
    data: {
      name: "Skincare",
      slug: "skincare",
      description: "Recommended clinic skincare products.",
      isActive: true,
    },
  });

  const vitaminC = await prisma.product.create({
    data: {
      categoryId: supplementsCategory.id,
      imageId: media.vitaminImage.id,
      name: "Vitamin C 1000mg",
      slug: "vitamin-c-1000mg",
      sku: "SUP-VC-1000",
      description: "Immune support supplement for daily use.",
      price: 2400,
      salePrice: 2100,
      stockQuantity: 120,
      isActive: true,
    },
  });

  const repairCream = await prisma.product.create({
    data: {
      categoryId: skincareCategory.id,
      imageId: media.creamImage.id,
      name: "Skin Repair Cream",
      slug: "skin-repair-cream",
      sku: "SKN-RPR-001",
      description:
        "Barrier repair cream recommended for dry and sensitive skin.",
      price: 3200,
      stockQuantity: 60,
      isActive: true,
    },
  });

  const cart = await prisma.cart.create({
    data: {
      patientId: profiles.patient1.id,
      items: {
        create: [
          {
            productId: vitaminC.id,
            quantity: 2,
            unitPrice: 2100,
            totalPrice: 4200,
          },
          {
            productId: repairCream.id,
            quantity: 1,
            unitPrice: 3200,
            totalPrice: 3200,
          },
        ],
      },
    },
  });

  const order = await prisma.order.create({
    data: {
      orderNumber: "ORD-2001",
      patientId: profiles.patient1.id,
      status: OrderStatus.shipped,
      paymentStatus: PaymentStatus.succeeded,
      shippingAddress: {
        fullName: "Alice Brown",
        phone: "+15550000021",
        address: "House 22, Garden Town, Lahore",
      },
      billingAddress: {
        fullName: "Alice Brown",
        phone: "+15550000021",
        address: "House 22, Garden Town, Lahore",
      },
      notes: "Seeded order for store and order tracking testing.",
      subtotalAmount: 5300,
      shippingAmount: 300,
      totalAmount: 5600,
      paidAt: new Date(),
      items: {
        create: [
          {
            productId: vitaminC.id,
            name: vitaminC.name,
            sku: vitaminC.sku,
            quantity: 1,
            unitPrice: 2100,
            totalPrice: 2100,
          },
          {
            productId: repairCream.id,
            name: repairCream.name,
            sku: repairCream.sku,
            quantity: 1,
            unitPrice: 3200,
            totalPrice: 3200,
          },
        ],
      },
      shipment: {
        create: {
          status: ShipmentStatus.shipped,
          carrier: "Leopards Courier",
          trackingNumber: "LCS-TRACK-2001",
          trackingUrl: "https://tracking.example.com/LCS-TRACK-2001",
          notes: "Out for delivery in the next 24 hours.",
          shippedAt: new Date(),
        },
      },
    },
  });

  return { cart, order, vitaminC, repairCream };
}

async function seedPayments(
  foundation: Awaited<ReturnType<typeof seedFoundation>>,
  appointments: Awaited<ReturnType<typeof seedAppointments>>,
  commerce: Awaited<ReturnType<typeof seedCommerce>>,
) {
  console.log("Seeding payments and refunds...");

  await prisma.payment.create({
    data: {
      appointmentId: appointments.appointment1.id,
      provider: PaymentProvider.stripe,
      methodType: PaymentMethodType.card,
      status: PaymentStatus.pending,
      amount: 8500,
      metadata: {
        label: "Upcoming consultation payment",
      },
    },
  });

  await prisma.payment.create({
    data: {
      appointmentId: appointments.appointment2.id,
      provider: PaymentProvider.paypal,
      methodType: PaymentMethodType.wallet,
      status: PaymentStatus.succeeded,
      amount: 7000,
      transactionId: "PAY-APT-1002",
      paidAt: new Date(),
      commissionAmount: 700,
      doctorNetAmount: 6300,
      metadata: {
        label: "Confirmed appointment payment",
      },
    },
  });

  const refundedPayment = await prisma.payment.create({
    data: {
      appointmentId: appointments.appointment3.id,
      provider: PaymentProvider.stripe,
      methodType: PaymentMethodType.card,
      status: PaymentStatus.refunded,
      amount: 7000,
      transactionId: "PAY-APT-1003",
      paidAt: daysFromNow(-5, 10, 30),
      refundedAt: new Date(),
      commissionAmount: 700,
      doctorNetAmount: 6300,
      metadata: {
        label: "Refunded tele-consultation payment",
      },
    },
  });

  await prisma.refund.create({
    data: {
      paymentId: refundedPayment.id,
      processedById: foundation.admin.id,
      amount: 7000,
      reason: "Refunded for completed testing scenario.",
      status: RefundStatus.processed,
      requestedAt: new Date(),
      processedAt: new Date(),
      metadata: {
        reasonCode: "seed_test_case",
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: commerce.order.id,
      provider: PaymentProvider.stripe,
      methodType: PaymentMethodType.card,
      status: PaymentStatus.succeeded,
      amount: 5600,
      transactionId: "PAY-ORD-2001",
      paidAt: new Date(),
      metadata: {
        label: "Store order payment",
      },
    },
  });
}

async function seedNotifications(
  foundation: Awaited<ReturnType<typeof seedFoundation>>,
) {
  console.log("Seeding campaigns and notifications...");

  const campaign = await prisma.notificationCampaign.create({
    data: {
      createdById: foundation.admin.id,
      title: "Ramadan Wellness Reminder",
      subject: "Stay healthy this month",
      message:
        "Hydration, sleep, and medication timing matter. Contact us if you need guidance.",
      channel: NotificationChannel.email,
      audience: CampaignAudience.patients,
      status: CampaignStatus.sent,
      sentAt: new Date(),
    },
  });

  await prisma.campaignRecipient.createMany({
    data: [
      {
        campaignId: campaign.id,
        userId: foundation.patientUser1.id,
        sentAt: new Date(),
      },
      {
        campaignId: campaign.id,
        userId: foundation.patientUser2.id,
        sentAt: new Date(),
      },
      {
        campaignId: campaign.id,
        userId: foundation.patientUser3.id,
        sentAt: new Date(),
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: foundation.patientUser1.id,
        title: "Appointment booked",
        message: "Your appointment with Dr. John Smith has been booked.",
        recipient: "patient1@example.com",
        purpose: NotificationPurpose.appointmentStatus,
        channels: [NotificationChannel.email],
        status: NotificationStatus.sent,
      },
      {
        userId: foundation.patientUser2.id,
        title: "Appointment confirmed",
        message: "Your dermatology appointment has been confirmed.",
        recipient: "patient2@example.com",
        purpose: NotificationPurpose.appointmentReminder,
        channels: [NotificationChannel.push],
        status: NotificationStatus.sent,
      },
      {
        userId: foundation.doctorUser1.id,
        title: "New patient message",
        message: "A patient sent a message in an appointment conversation.",
        recipient: "dr.smith@example.com",
        purpose: NotificationPurpose.newChatMessage,
        channels: [NotificationChannel.email],
        status: NotificationStatus.sent,
      },
      {
        userId: foundation.patientUser1.id,
        title: "Order shipped",
        message: "Your pharmacy order has been shipped.",
        recipient: "+15550000021",
        purpose: NotificationPurpose.orderStatus,
        channels: [NotificationChannel.sms],
        status: NotificationStatus.sent,
      },
      {
        userId: foundation.admin.id,
        title: "Doctor verification pending",
        message: "Dr. Sarah Khan is waiting for review.",
        recipient: "admin@example.com",
        purpose: NotificationPurpose.userStatus,
        channels: [NotificationChannel.email],
        status: NotificationStatus.pending,
      },
    ],
  });
}

async function main() {
  console.log("Starting Prisma seed...");
  console.log(`Default seed password: ${DEFAULT_PASSWORD}`);

  try {
    await clearDatabase();

    const foundation = await seedFoundation();
    const media = await seedMedia(foundation);
    const profiles = await seedProfiles(foundation, media);
    await seedAvailability(profiles);
    const appointments = await seedAppointments(foundation, profiles);
    await seedConversations(foundation, profiles, appointments, media);
    const commerce = await seedCommerce(foundation, profiles, media);
    await seedPayments(foundation, appointments, commerce);
    await seedNotifications(foundation);

    console.log("Seed completed successfully.");
    console.log("Seeded logins:");
    console.log("  admin@example.com / Test@123456");
    console.log("  dr.smith@example.com / Test@123456");
    console.log("  dr.jones@example.com / Test@123456");
    console.log("  dr.pending@example.com / Test@123456");
    console.log("  patient1@example.com / Test@123456");
    console.log("  patient2@example.com / Test@123456");
    console.log("  patient3@example.com / Test@123456");
  } catch (error) {
    console.error("Seed failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
