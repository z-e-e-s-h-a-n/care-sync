import "dotenv/config";
import argon2 from "argon2";
import { faker } from "@faker-js/faker";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  AppointmentCancellationSource,
  AppointmentChannel,
  AppointmentStatus,
  BookingSource,
  CampaignAudience,
  CampaignStatus,
  ConversationStatus,
  ConversationType,
  DeliveryType,
  DoctorVerificationStatus,
  Gender,
  IdentificationType,
  InventoryStatus,
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
  ProductStatus,
  RefundStatus,
  ShipmentStatus,
  ThemeMode,
  UserRole,
  UserStatus,
  Weekday,
} from "../prisma/generated/client";

const connectionString = process.env.DB_URI;

if (!connectionString) {
  throw new Error("DB_URI is required to run the Prisma seed.");
}

faker.seed(42);

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const DEFAULT_PASSWORD = "Test@123456";
const DEFAULT_TIMEZONE = "America/New_York";

const DOCTOR_AVATAR_URLS = [
  "https://res.cloudinary.com/ddyclchvl/image/upload/v1774982442/dr-green_pdhuvj.png",
  "https://res.cloudinary.com/ddyclchvl/image/upload/v1774982442/dr-livingston_i43hxl.png",
  "https://res.cloudinary.com/ddyclchvl/image/upload/v1774982442/dr-lee_ry7b3x.png",
  "https://res.cloudinary.com/ddyclchvl/image/upload/v1774982442/dr-peter_bbyhrp.png",
  "https://res.cloudinary.com/ddyclchvl/image/upload/v1774982442/dr-sharma_wpohkb.png",
  "https://res.cloudinary.com/ddyclchvl/image/upload/v1774982441/dr-cameron_pjdtyj.png",
  "https://res.cloudinary.com/ddyclchvl/image/upload/v1774982441/dr-cruz_quesgp.png",
  "https://res.cloudinary.com/ddyclchvl/image/upload/v1774982441/dr-remirez_awgz8x.png",
  "https://res.cloudinary.com/ddyclchvl/image/upload/v1774982441/dr-powell_ijzxbe.png",
];

const ADMIN_AVATAR_URL =
  "https://res.cloudinary.com/ddyclchvl/image/upload/v1774982441/admin_c0a0gt.png";

const STAFF_AVATAR_URLS = [
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1594824475317-6e07f695f1b4?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
];

const PRODUCT_IMAGE_URLS = [
  "https://images.unsplash.com/photo-1516549655669-df33a03d4a4a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1514413494665-c83134d9ebdd?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80",
];

const daysFromNow = (days: number, hour = 9, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const hoursAfter = (date: Date, hours: number, minutes = 0) =>
  new Date(date.getTime() + hours * 60 * 60 * 1000 + minutes * 60 * 1000);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function clearDatabase() {
  console.log("Clearing existing seed data...");

  await prisma.dataPoint.deleteMany();
  await prisma.sessionNote.deleteMany();
  await prisma.behaviorProgram.deleteMany();
  await prisma.progressReport.deleteMany();
  await prisma.insuranceAuthorization.deleteMany();
  await prisma.treatmentPlan.deleteMany();
  await prisma.staffAssignment.deleteMany();
  await prisma.caregiverAccess.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.messageAttachment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctorBlockedTime.deleteMany();
  await prisma.doctorAvailability.deleteMany();
  await prisma.campaignRecipient.deleteMany();
  await prisma.notificationCampaign.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.otp.deleteMany();
  await prisma.session.deleteMany();
  await prisma.staffProfile.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.branchTiming.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.businessProfile.deleteMany();
  await prisma.media.deleteMany();
  await prisma.user.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.trafficSource.deleteMany();
}

async function seedFoundation() {
  console.log("Seeding users...");

  const hashedPassword = await argon2.hash(DEFAULT_PASSWORD);

  const admin = await prisma.user.create({
    data: {
      firstName: "Alex",
      lastName: "Morgan",
      displayName: "Alex Morgan",
      email: "admin@caresync.demo",
      phone: "+15550000001",
      password: hashedPassword,
      role: UserRole.admin,
      status: UserStatus.active,
      isEmailVerified: true,
      isPhoneVerified: true,
      preferredTheme: ThemeMode.system,
      pushNotifications: true,
      loginAlerts: true,
    },
  });

  const doctorSeeds = [
    { firstName: "Olivia", lastName: "Green", specialty: "Family Medicine" },
    { firstName: "Ethan", lastName: "Livingston", specialty: "Cardiology" },
    { firstName: "Mia", lastName: "Lee", specialty: "Dermatology" },
    { firstName: "Noah", lastName: "Peter", specialty: "Pediatrics" },
    { firstName: "Ava", lastName: "Sharma", specialty: "Internal Medicine" },
    { firstName: "Lucas", lastName: "Cameron", specialty: "Orthopedics" },
    { firstName: "Sophia", lastName: "Cruz", specialty: "Gynecology" },
    { firstName: "Mateo", lastName: "Ramirez", specialty: "Neurology" },
    { firstName: "Isabella", lastName: "Powell", specialty: "Psychiatry" },
  ] as const;

  const doctors = await Promise.all(
    doctorSeeds.map((doctor, index) =>
      prisma.user.create({
        data: {
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          displayName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          email: `dr.${doctor.lastName.toLowerCase()}@caresync.demo`,
          phone: `+1555000001${index + 1}`,
          password: hashedPassword,
          role: UserRole.doctor,
          status: UserStatus.active,
          isEmailVerified: true,
          isPhoneVerified: true,
          pushNotifications: true,
        },
      }),
    ),
  );

  const staffSeeds = [
    {
      firstName: "Harper",
      lastName: "Quinn",
      title: "BCBA",
      specialty: "Behavior Program Oversight",
      credentials: ["BCBA", "M.Ed. ABA"],
    },
    {
      firstName: "Liam",
      lastName: "Brooks",
      title: "RBT",
      specialty: "Direct Therapy Sessions",
      credentials: ["RBT"],
    },
    {
      firstName: "Emma",
      lastName: "Diaz",
      title: "BCaBA",
      specialty: "Parent Training & Supervision",
      credentials: ["BCaBA", "CPR"],
    },
    {
      firstName: "James",
      lastName: "Cole",
      title: "Program Manager",
      specialty: "Scheduling & Care Coordination",
      credentials: ["Operations Lead"],
    },
  ] as const;

  const staff = await Promise.all(
    staffSeeds.map((member, index) =>
      prisma.user.create({
        data: {
          firstName: member.firstName,
          lastName: member.lastName,
          displayName: `${member.firstName} ${member.lastName}`,
          email: `staff.${member.lastName.toLowerCase()}@caresync.demo`,
          phone: `+1555000003${index + 1}`,
          password: hashedPassword,
          role: UserRole.staff,
          status: UserStatus.active,
          isEmailVerified: true,
          isPhoneVerified: true,
          pushNotifications: true,
        },
      }),
    ),
  );

  const patients = await Promise.all(
    Array.from({ length: 14 }).map((_, index) => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = `patient${index + 1}@caresync.demo`;
      const phone = `+1555000002${(index + 1).toString().padStart(2, "0")}`;

      return prisma.user.create({
        data: {
          firstName,
          lastName,
          displayName: `${firstName} ${lastName}`,
          email,
          phone,
          password: hashedPassword,
          role: UserRole.patient,
          status: UserStatus.active,
          isEmailVerified: true,
          isPhoneVerified: true,
          pushNotifications: index % 2 === 0,
        },
      });
    }),
  );

  return { admin, doctors, patients, staff, doctorSeeds, staffSeeds };
}

async function seedMedia(
  foundation: Awaited<ReturnType<typeof seedFoundation>>,
) {
  console.log("Seeding media...");

  const adminAvatar = await prisma.media.create({
    data: {
      uploadedById: foundation.admin.id,
      publicId: "prod-seed/admin-avatar",
      url: `${ADMIN_AVATAR_URL}?v=admin-avatar`,
      mimeType: "image/png",
      resourceType: "image",
      size: 125000,
      hash: "prod-seed-admin-avatar-hash",
      name: "admin-avatar.png",
      type: MediaType.avatar,
      visibility: MediaVisibility.public,
      altText: "Admin avatar",
    },
  });

  const doctorAvatars = await Promise.all(
    foundation.doctors.map((doctor, index) =>
      prisma.media.create({
        data: {
          uploadedById: foundation.admin.id,
          publicId: `prod-seed/doctor-${index + 1}-avatar`,
          url: `${DOCTOR_AVATAR_URLS[index]}?v=doctor-${index + 1}`,
          mimeType: "image/png",
          resourceType: "image",
          size: 160000,
          hash: `prod-seed-doctor-${index + 1}-avatar-hash`,
          name: `doctor-${index + 1}-avatar.png`,
          type: MediaType.avatar,
          visibility: MediaVisibility.public,
          altText: `${doctor.displayName} avatar`,
        },
      }),
    ),
  );

  const staffAvatars = await Promise.all(
    foundation.staff.map((member, index) =>
      prisma.media.create({
        data: {
          uploadedById: foundation.admin.id,
          publicId: `prod-seed/staff-${index + 1}-avatar`,
          url: `${STAFF_AVATAR_URLS[index % STAFF_AVATAR_URLS.length]}&v=staff-${index + 1}`,
          mimeType: "image/jpeg",
          resourceType: "image",
          size: 145000,
          hash: `prod-seed-staff-${index + 1}-avatar-hash`,
          name: `staff-${index + 1}-avatar.jpg`,
          type: MediaType.avatar,
          visibility: MediaVisibility.public,
          altText: `${member.displayName} avatar`,
        },
      }),
    ),
  );

  const businessLogo = await prisma.media.create({
    data: {
      uploadedById: foundation.admin.id,
      publicId: "prod-seed/business-logo",
      url: `${ADMIN_AVATAR_URL}?v=business-logo`,
      mimeType: "image/png",
      resourceType: "image",
      size: 65000,
      hash: "prod-seed-business-logo-hash",
      name: "business-logo.png",
      type: MediaType.other,
      visibility: MediaVisibility.public,
      altText: "CareSync logo",
    },
  });

  const businessFavicon = await prisma.media.create({
    data: {
      uploadedById: foundation.admin.id,
      publicId: "prod-seed/business-favicon",
      url: `${ADMIN_AVATAR_URL}?v=business-favicon`,
      mimeType: "image/png",
      resourceType: "image",
      size: 12000,
      hash: "prod-seed-business-favicon-hash",
      name: "business-favicon.png",
      type: MediaType.other,
      visibility: MediaVisibility.public,
      altText: "CareSync favicon",
    },
  });

  const businessCover = await prisma.media.create({
    data: {
      uploadedById: foundation.admin.id,
      publicId: "prod-seed/business-cover",
      url: `${DOCTOR_AVATAR_URLS[0]}?v=business-cover`,
      mimeType: "image/png",
      resourceType: "image",
      size: 240000,
      hash: "prod-seed-business-cover-hash",
      name: "business-cover.png",
      type: MediaType.other,
      visibility: MediaVisibility.public,
      altText: "CareSync cover image",
    },
  });

  await prisma.user.update({
    where: { id: foundation.admin.id },
    data: { avatarId: adminAvatar.id },
  });

  await Promise.all(
    foundation.doctors.map((doctor, index) =>
      prisma.user.update({
        where: { id: doctor.id },
        data: { avatarId: doctorAvatars[index]?.id },
      }),
    ),
  );

  await Promise.all(
    foundation.staff.map((member, index) =>
      prisma.user.update({
        where: { id: member.id },
        data: { avatarId: staffAvatars[index]?.id },
      }),
    ),
  );

  return {
    adminAvatar,
    doctorAvatars,
    staffAvatars,
    businessLogo,
    businessFavicon,
    businessCover,
  };
}

async function seedBusinessAndBranches(
  foundation: Awaited<ReturnType<typeof seedFoundation>>,
  media: Awaited<ReturnType<typeof seedMedia>>,
) {
  console.log("Seeding business profile and branches...");

  const businessProfile = await prisma.businessProfile.create({
    data: {
      name: "CareSync Health",
      legalName: "CareSync Health Inc.",
      description:
        "A modern healthcare platform connecting patients with verified doctors, clinics, and pharmacy services.",
      faviconId: media.businessFavicon.id,
      logoId: media.businessLogo.id,
      coverId: media.businessCover.id,
      email: "support@caresync.demo",
      phone: "+15551234567",
      whatsapp: "+15551234567",
      website: "https://caresync.demo",
      facebook: "caresyncdemo",
      instagram: "caresyncdemo",
      tiktok: "caresyncdemo",
      twitter: "caresyncdemo",
      linkedin: "caresyncdemo",
      metaTitle: "CareSync - Book a Doctor in Minutes",
      metaDescription:
        "Find doctors, book appointments, chat securely, and order pharmacy items—all in one place.",
    },
  });

  const nycBranch = await prisma.branch.create({
    data: {
      businessProfileId: businessProfile.id,
      name: "Manhattan Clinic",
      slug: "manhattan",
      email: "manhattan@caresync.demo",
      phone: "+12125550101",
      whatsapp: "+12125550101",
      street: "350 5th Ave",
      city: "New York",
      state: "NY",
      postalCode: "10118",
      country: "United States",
      timezone: "America/New_York",
      isActive: true,
    },
  });

  const austinBranch = await prisma.branch.create({
    data: {
      businessProfileId: businessProfile.id,
      name: "Downtown Austin Clinic",
      slug: "austin-downtown",
      email: "austin@caresync.demo",
      phone: "+15125550102",
      whatsapp: "+15125550102",
      street: "200 Congress Ave",
      city: "Austin",
      state: "TX",
      postalCode: "78701",
      country: "United States",
      timezone: "America/Chicago",
      isActive: true,
    },
  });

  const santaMonicaBranch = await prisma.branch.create({
    data: {
      businessProfileId: businessProfile.id,
      name: "Santa Monica Clinic",
      slug: "santa-monica",
      email: "santamonica@caresync.demo",
      phone: "+13105550103",
      whatsapp: "+13105550103",
      street: "1301 2nd St",
      city: "Santa Monica",
      state: "CA",
      postalCode: "90401",
      country: "United States",
      timezone: "America/Los_Angeles",
      isActive: true,
    },
  });

  const weekdays = [
    Weekday.monday,
    Weekday.tuesday,
    Weekday.wednesday,
    Weekday.thursday,
    Weekday.friday,
  ];

  for (const branch of [nycBranch, austinBranch, santaMonicaBranch]) {
    for (const weekday of weekdays) {
      await prisma.branchTiming.create({
        data: {
          branchId: branch.id,
          weekday,
          openTime: "09:00",
          closeTime: "18:00",
          isClosed: false,
        },
      });
    }

    await prisma.branchTiming.createMany({
      data: [
        {
          branchId: branch.id,
          weekday: Weekday.saturday,
          openTime: "10:00",
          closeTime: "14:00",
          isClosed: false,
        },
        {
          branchId: branch.id,
          weekday: Weekday.sunday,
          openTime: "00:00",
          closeTime: "00:00",
          isClosed: true,
        },
      ],
    });
  }

  return { businessProfile, nycBranch, austinBranch, santaMonicaBranch };
}

async function seedProfiles(
  foundation: Awaited<ReturnType<typeof seedFoundation>>,
  branches: Awaited<ReturnType<typeof seedBusinessAndBranches>>,
) {
  console.log("Seeding patient, doctor, and staff profiles...");

  const patients = await Promise.all(
    foundation.patients.map((user, index) =>
      prisma.patientProfile.create({
        data: {
          userId: user.id,
          birthDate: faker.date.birthdate({ min: 18, max: 70, mode: "age" }),
          gender: ([Gender.male, Gender.female, Gender.other] as const)[
            index % 3
          ],
          address: faker.location.streetAddress({ useFullAddress: true }),
          occupation: faker.person.jobTitle(),
          emergencyContactName: faker.person.fullName(),
          emergencyContactNumber: "+15550000999",
          insuranceProvider: ["Aetna", "UnitedHealthcare", "Blue Cross"][
            index % 3
          ],
          insurancePolicyNumber: `US-${faker.string.alphanumeric({
            length: 10,
            casing: "upper",
          })}`,
          allergies: index % 3 === 0 ? "Penicillin" : "None reported",
          currentMedication: index % 4 === 0 ? "Lisinopril" : "None",
          familyMedicalHistory:
            index % 2 === 0 ? "Family history of hypertension." : null,
          pastMedicalHistory: index % 3 === 0 ? "Seasonal allergies." : null,
          identificationType:
            index % 2 === 0
              ? IdentificationType.driversLicense
              : IdentificationType.passport,
          identificationNumber:
            index % 2 === 0
              ? `DL-${faker.string.alphanumeric({
                  length: 9,
                  casing: "upper",
                })}`
              : `P-${faker.string.alphanumeric({
                  length: 9,
                  casing: "upper",
                })}`,
        },
      }),
    ),
  );

  const branchPool = [
    branches.nycBranch,
    branches.austinBranch,
    branches.santaMonicaBranch,
  ];

  const doctors = await Promise.all(
    foundation.doctors.map((user, index) => {
      const seed = foundation.doctorSeeds[index];
      const fullName = `${seed.firstName} ${seed.lastName}`;
      const slug = `dr-${slugify(fullName)}`;

      return prisma.doctorProfile.create({
        data: {
          userId: user.id,
          branchId: branchPool[index % branchPool.length].id,
          createdById: foundation.admin.id,
          verifiedById: foundation.admin.id,
          slug,
          title: "Dr.",
          specialty: seed.specialty,
          bio: `${seed.specialty} physician available for in-person and virtual consults.`,
          licenseNumber: `US-MD-${1000 + index}`,
          yearsExperience: 5 + index,
          education: "MD (USA)",
          qualifications: "Board certified (demo data).",
          languages: ["English", index % 2 === 0 ? "Spanish" : "French"],
          consultationFee: 120 + index * 10,
          commissionPercent: 12.5,
          verificationStatus: DoctorVerificationStatus.verified,
          verifiedAt: new Date(),
          isAvailable: true,
        },
      });
    }),
  );

  const staff = await Promise.all(
    foundation.staff.map((user, index) =>
      prisma.staffProfile.create({
        data: {
          userId: user.id,
          branchId: branchPool[index % branchPool.length].id,
          title: foundation.staffSeeds[index]!.title,
          specialty: foundation.staffSeeds[index]!.specialty,
          bio: `${foundation.staffSeeds[index]!.title} supporting therapy operations and patient care.`,
          credentials: [...foundation.staffSeeds[index]!.credentials],
          isActive: true,
        },
      }),
    ),
  );

  return { patients, doctors, staff };
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

  for (const doctor of profiles.doctors) {
    for (const weekday of weekdays) {
      await prisma.doctorAvailability.create({
        data: {
          doctorId: doctor.id,
          weekday,
          startTime: "09:00",
          endTime: "17:00",
          slotDurationMinute: 30,
          isActive: true,
        },
      });
    }
  }

  if (profiles.doctors[0]) {
    await prisma.doctorBlockedTime.create({
      data: {
        doctorId: profiles.doctors[0].id,
        startAt: daysFromNow(3, 10, 0),
        endAt: daysFromNow(3, 12, 0),
        reason: "Conference block (demo)",
      },
    });
  }
}

async function seedAppointments(
  foundation: Awaited<ReturnType<typeof seedFoundation>>,
  profiles: Awaited<ReturnType<typeof seedProfiles>>,
  branches: Awaited<ReturnType<typeof seedBusinessAndBranches>>,
) {
  console.log("Seeding appointments...");

  const branchPool = [
    branches.nycBranch,
    branches.austinBranch,
    branches.santaMonicaBranch,
  ];

  const statusPool = [
    AppointmentStatus.booked,
    AppointmentStatus.confirmed,
    AppointmentStatus.completed,
    AppointmentStatus.cancelled,
  ];

  const appointments = [];

  for (let index = 0; index < 24; index++) {
    const patient = profiles.patients[index % profiles.patients.length];
    const doctor = profiles.doctors[index % profiles.doctors.length];
    const branch = branchPool[index % branchPool.length];
    const status = statusPool[index % statusPool.length];
    const start = daysFromNow(index % 7, 9 + (index % 6), 0);

    appointments.push(
      prisma.appointment.create({
        data: {
          appointmentNumber: `APT-US-${(1001 + index).toString()}`,
          branchId: branch.id,
          patientId: patient.id,
          doctorId: doctor.id,
          createdById:
            index % 3 === 0 ? foundation.admin.id : foundation.patients[0]?.id,
          status,
          bookingSource:
            index % 3 === 0 ? BookingSource.admin : BookingSource.app,
          channel:
            index % 2 === 0
              ? AppointmentChannel.inPerson
              : AppointmentChannel.virtual,
          paymentStatus:
            status === AppointmentStatus.completed
              ? PaymentStatus.succeeded
              : PaymentStatus.pending,
          scheduledStartAt: start,
          scheduledEndAt: hoursAfter(start, 0, 30),
          timezone: DEFAULT_TIMEZONE,
          patientNotes: faker.lorem.sentence(),
          confirmedAt:
            status === AppointmentStatus.confirmed ||
            status === AppointmentStatus.completed
              ? new Date()
              : null,
          completedAt:
            status === AppointmentStatus.completed
              ? hoursAfter(start, 0, 30)
              : null,
          cancelledAt:
            status === AppointmentStatus.cancelled ? new Date() : null,
          cancellationSource:
            status === AppointmentStatus.cancelled
              ? AppointmentCancellationSource.patient
              : null,
          cancellationReason:
            status === AppointmentStatus.cancelled ? "Schedule conflict" : null,
          paidAt: status === AppointmentStatus.completed ? new Date() : null,
        },
      }),
    );
  }

  return Promise.all(appointments);
}

async function seedConversations(
  foundation: Awaited<ReturnType<typeof seedFoundation>>,
  profiles: Awaited<ReturnType<typeof seedProfiles>>,
  appointments: Awaited<ReturnType<typeof seedAppointments>>,
  branches: Awaited<ReturnType<typeof seedBusinessAndBranches>>,
) {
  console.log("Seeding conversations and messages...");

  const messages = [];

  for (const appointment of appointments.slice(0, 8)) {
    const conversation = await prisma.conversation.create({
      data: {
        appointmentId: appointment.id,
        branchId: appointment.branchId,
        patientId: appointment.patientId,
        assignedToId: foundation.admin.id,
        type: ConversationType.appointment,
        status: ConversationStatus.open,
        subject: "Appointment chat (demo)",
        lastMessageAt: new Date(),
      },
    });

    messages.push(
      prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: foundation.patients[0]!.id,
          body: "Hi doctor, I have a quick question before the visit.",
        },
      }),
      prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: foundation.doctors[0]!.id,
          body: "Sure — please share your symptoms and when they started.",
        },
      }),
    );
  }

  const supportConversation = await prisma.conversation.create({
    data: {
      branchId: branches.nycBranch.id,
      patientId: profiles.patients[0]!.id,
      assignedToId: foundation.admin.id,
      type: ConversationType.support,
      status: ConversationStatus.open,
      subject: "Support: account & booking help",
      lastMessageAt: new Date(),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: supportConversation.id,
        senderId: foundation.patients[0]!.id,
        body: "Can you help me reschedule my appointment?",
      },
      {
        conversationId: supportConversation.id,
        senderId: foundation.admin.id,
        body: "Yes — please confirm your preferred day/time and we’ll update it.",
      },
    ],
  });

  await Promise.all(messages);
}

async function seedPayments(
  foundation: Awaited<ReturnType<typeof seedFoundation>>,
  appointments: Awaited<ReturnType<typeof seedAppointments>>,
) {
  console.log("Seeding payments and refunds...");

  const createdAt = (daysAgo: number, hour = 10, minute = 0) =>
    daysFromNow(-daysAgo, hour, minute);

  const bookedAppointment = appointments.find(
    (appointment) => appointment.status === AppointmentStatus.booked,
  );
  const confirmedAppointment = appointments.find(
    (appointment) => appointment.status === AppointmentStatus.confirmed,
  );
  const completedAppointment = appointments.find(
    (appointment) => appointment.status === AppointmentStatus.completed,
  );
  const cancelledAppointment = appointments.find(
    (appointment) => appointment.status === AppointmentStatus.cancelled,
  );

  if (bookedAppointment) {
    await prisma.payment.create({
      data: {
        appointmentId: bookedAppointment.id,
        provider: PaymentProvider.stripe,
        methodType: PaymentMethodType.card,
        status: PaymentStatus.pending,
        amount: 140,
        createdAt: createdAt(6, 11),
        metadata: { label: "Upcoming appointment payment", demo: true },
      },
    });
  }

  if (confirmedAppointment) {
    await prisma.payment.create({
      data: {
        appointmentId: confirmedAppointment.id,
        provider: PaymentProvider.paypal,
        methodType: PaymentMethodType.wallet,
        status: PaymentStatus.succeeded,
        amount: 160,
        transactionId: `PAY-APT-${confirmedAppointment.appointmentNumber}`,
        createdAt: createdAt(5, 14),
        paidAt: createdAt(5, 14),
        commissionAmount: 20,
        doctorNetAmount: 140,
        metadata: { label: "Confirmed appointment payment", demo: true },
      },
    });
  }

  if (cancelledAppointment) {
    await prisma.payment.create({
      data: {
        appointmentId: cancelledAppointment.id,
        provider: PaymentProvider.stripe,
        methodType: PaymentMethodType.card,
        status: PaymentStatus.failed,
        amount: 150,
        createdAt: createdAt(4, 9),
        failureMessage: "Card authorization failed (demo).",
        metadata: { label: "Failed appointment payment", demo: true },
      },
    });
  }

  if (completedAppointment) {
    const refundedPayment = await prisma.payment.create({
      data: {
        appointmentId: completedAppointment.id,
        provider: PaymentProvider.stripe,
        methodType: PaymentMethodType.card,
        status: PaymentStatus.refunded,
        amount: 150,
        transactionId: `PAY-APT-${completedAppointment.appointmentNumber}`,
        createdAt: createdAt(3, 16),
        paidAt: createdAt(3, 16),
        refundedAt: createdAt(2, 12),
        commissionAmount: 18.75,
        doctorNetAmount: 131.25,
        metadata: { label: "Refunded appointment payment", demo: true },
      },
    });

    await prisma.refund.create({
      data: {
        paymentId: refundedPayment.id,
        processedById: foundation.admin.id,
        amount: 150,
        reason: "Demo refund for reporting coverage.",
        status: RefundStatus.processed,
        requestedAt: createdAt(2, 12),
        processedAt: createdAt(2, 12),
        metadata: { demo: true },
      },
    });
  }
}

async function seedCommerce(
  foundation: Awaited<ReturnType<typeof seedFoundation>>,
) {
  console.log("Seeding product catalog, carts, orders, and shipments...");

  const therapyTools = await prisma.productCategory.create({
    data: {
      name: "Therapy Tools",
      slug: "therapy-tools",
      description: "ABA-ready therapy aids and reinforcement tools.",
      isActive: true,
    },
  });

  const parentResources = await prisma.productCategory.create({
    data: {
      name: "Parent Resources",
      slug: "parent-resources",
      description: "At-home support kits and caregiver resources.",
      isActive: true,
    },
  });

  const sensoryCategory = await prisma.productCategory.create({
    data: {
      parentId: therapyTools.id,
      name: "Sensory Support",
      slug: "sensory-support",
      description: "Sensory regulation and calming items.",
      isActive: true,
    },
  });

  const productSeeds = [
    {
      name: "Visual Schedule Board",
      slug: "visual-schedule-board",
      description:
        "Portable daily routine board with reusable icons for ABA sessions and home routines.",
      price: 24.99,
      compareAtPrice: 29.99,
      stockCount: 42,
      categoryId: therapyTools.id,
    },
    {
      name: "Token Economy Starter Kit",
      slug: "token-economy-starter-kit",
      description:
        "Reinforcement board, tokens, and reward cards for skill acquisition sessions.",
      price: 18.5,
      compareAtPrice: null,
      stockCount: 67,
      categoryId: therapyTools.id,
    },
    {
      name: "Calm Corner Sensory Bundle",
      slug: "calm-corner-sensory-bundle",
      description:
        "Weighted lap pad, fidget tools, and calming visuals for self-regulation support.",
      price: 54.0,
      compareAtPrice: 62.0,
      stockCount: 14,
      categoryId: sensoryCategory.id,
    },
    {
      name: "Parent Coaching Workbook",
      slug: "parent-coaching-workbook",
      description:
        "Guided home practice workbook with routines, behavior tips, and progress pages.",
      price: 16.75,
      compareAtPrice: null,
      stockCount: 85,
      categoryId: parentResources.id,
    },
    {
      name: "AAC Communication Cards",
      slug: "aac-communication-cards",
      description:
        "Durable laminated communication cards for requests, emotions, and transitions.",
      price: 21.25,
      compareAtPrice: 25.0,
      stockCount: 26,
      categoryId: therapyTools.id,
    },
    {
      name: "Fine Motor Activity Box",
      slug: "fine-motor-activity-box",
      description:
        "Structured fine-motor tasks for table time, matching, and independent work practice.",
      price: 39.99,
      compareAtPrice: null,
      stockCount: 9,
      categoryId: therapyTools.id,
    },
  ] as const;

  const products = await Promise.all(
    productSeeds.map((product, index) =>
      prisma.product
        .create({
          data: {
            categoryId: product.categoryId,
            name: product.name,
            slug: product.slug,
            description: product.description,
            sellPrice: product.price,
            compareAtPrice: product.compareAtPrice,
            stockCount: product.stockCount,
            requiresShipping: true,
            status: ProductStatus.active,
            inventoryStatus:
              product.stockCount <= 10
                ? InventoryStatus.lowStock
                : InventoryStatus.inStock,
          },
        })
        .then(async (createdProduct) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const media = await prisma.media.create({
            data: {
              uploadedById: foundation.admin.id,
              publicId: `prod-seed/product-${index + 1}`,
              url: `${PRODUCT_IMAGE_URLS[index % PRODUCT_IMAGE_URLS.length]}&v=product-${index + 1}`,
              mimeType: "image/jpeg",
              resourceType: "image",
              size: 210000,
              hash: `prod-seed-product-${index + 1}-hash`,
              name: `${createdProduct.slug}.jpg`,
              type: MediaType.product,
              visibility: MediaVisibility.public,
              altText: createdProduct.name,
              productId: createdProduct.id,
            },
          });

          return createdProduct;
        }),
    ),
  );

  await prisma.cartItem.createMany({
    data: [
      {
        userId: foundation.patients[0]!.id,
        productId: products[0]!.id,
        quantity: 1,
      },
      {
        userId: foundation.patients[0]!.id,
        productId: products[3]!.id,
        quantity: 2,
      },
      {
        userId: foundation.patients[1]!.id,
        productId: products[2]!.id,
        quantity: 1,
      },
    ],
  });

  const orderData = [
    {
      patient: foundation.patients[0]!,
      status: OrderStatus.processing,
      deliveryType: DeliveryType.delivery,
      items: [
        { product: products[0]!, quantity: 1 },
        { product: products[3]!, quantity: 1 },
      ],
      shippingName: foundation.patients[0]!.displayName,
      shippingPhone: foundation.patients[0]!.phone,
      shippingStreet: "1200 Broadway",
      shippingCity: "New York",
      shippingState: "NY",
      shippingPostalCode: "10001",
      shippingCountry: "United States",
      shippingCost: 8.5,
      discountAmount: 0,
    },
    {
      patient: foundation.patients[1]!,
      status: OrderStatus.delivered,
      deliveryType: DeliveryType.delivery,
      items: [{ product: products[2]!, quantity: 1 }],
      shippingName: foundation.patients[1]!.displayName,
      shippingPhone: foundation.patients[1]!.phone,
      shippingStreet: "501 Congress Ave",
      shippingCity: "Austin",
      shippingState: "TX",
      shippingPostalCode: "78701",
      shippingCountry: "United States",
      shippingCost: 10,
      discountAmount: 5,
    },
    {
      patient: foundation.patients[2]!,
      status: OrderStatus.pending,
      deliveryType: DeliveryType.pickup,
      items: [
        { product: products[1]!, quantity: 2 },
        { product: products[4]!, quantity: 1 },
      ],
      shippingName: null,
      shippingPhone: null,
      shippingStreet: null,
      shippingCity: null,
      shippingState: null,
      shippingPostalCode: null,
      shippingCountry: null,
      shippingCost: 0,
      discountAmount: 0,
    },
  ] as const;

  const orders = [];

  for (const [index, orderSeed] of orderData.entries()) {
    const subtotal = orderSeed.items.reduce(
      (sum, item) => sum + Number(item.product.sellPrice) * item.quantity,
      0,
    );
    const total = subtotal + orderSeed.shippingCost - orderSeed.discountAmount;

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-US-${2001 + index}`,
        userId: orderSeed.patient.id,
        status: orderSeed.status,
        deliveryType: orderSeed.deliveryType,
        shippingName: orderSeed.shippingName,
        shippingPhone: orderSeed.shippingPhone,
        shippingStreet: orderSeed.shippingStreet,
        shippingCity: orderSeed.shippingCity,
        shippingState: orderSeed.shippingState,
        shippingPostalCode: orderSeed.shippingPostalCode,
        shippingCountry: orderSeed.shippingCountry,
        subtotal,
        shippingCost: orderSeed.shippingCost,
        discountAmount: orderSeed.discountAmount,
        total,
        notes:
          orderSeed.deliveryType === DeliveryType.pickup
            ? "Customer will collect from branch reception."
            : "Handle with care - demo seed order.",
        confirmedAt:
          orderSeed.status !== OrderStatus.pending
            ? daysFromNow(-2, 10, 30)
            : null,
        shippedAt:
          orderSeed.status === OrderStatus.processing ||
          orderSeed.status === OrderStatus.delivered
            ? daysFromNow(-1, 12, 0)
            : null,
        deliveredAt:
          orderSeed.status === OrderStatus.delivered
            ? daysFromNow(-0, 15, 30)
            : null,
        items: {
          create: orderSeed.items.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            unitPrice: item.product.sellPrice,
            quantity: item.quantity,
            totalPrice: Number(item.product.sellPrice) * item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    if (order.status !== OrderStatus.pending) {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider:
            index % 2 === 0 ? PaymentProvider.stripe : PaymentProvider.paypal,
          methodType:
            index % 2 === 0 ? PaymentMethodType.card : PaymentMethodType.wallet,
          status:
            order.status === OrderStatus.delivered
              ? PaymentStatus.succeeded
              : PaymentStatus.pending,
          amount: total,
          transactionId: `PAY-ORD-${order.orderNumber}`,
          paidAt:
            order.status === OrderStatus.delivered
              ? daysFromNow(-2, 10, 30)
              : null,
          metadata: { label: "Demo store order payment", demo: true },
        },
      });
    }

    if (
      order.status === OrderStatus.processing ||
      order.status === OrderStatus.delivered
    ) {
      await prisma.shipment.create({
        data: {
          orderId: order.id,
          status:
            order.status === OrderStatus.delivered
              ? ShipmentStatus.delivered
              : ShipmentStatus.inTransit,
          provider: "UPS",
          trackingNumber: `1ZDEMO${2001 + index}`,
          trackingUrl: `https://www.ups.com/track?tracknum=1ZDEMO${2001 + index}`,
          shippedAt: daysFromNow(-1, 12, 0),
          deliveredAt:
            order.status === OrderStatus.delivered
              ? daysFromNow(0, 15, 30)
              : null,
        },
      });
    }

    orders.push(order);
  }

  return {
    products,
    orders,
    categories: { therapyTools, parentResources, sensoryCategory },
  };
}

async function seedNotifications(
  foundation: Awaited<ReturnType<typeof seedFoundation>>,
) {
  console.log("Seeding campaigns and notifications...");

  const campaign = await prisma.notificationCampaign.create({
    data: {
      createdById: foundation.admin.id,
      title: "Welcome to CareSync",
      subject: "Thanks for joining CareSync",
      message:
        "Book your first appointment, chat with your doctor, and explore our demo store.",
      channel: NotificationChannel.email,
      audience: CampaignAudience.patients,
      status: CampaignStatus.sent,
      sentAt: new Date(),
    },
  });

  await prisma.campaignRecipient.createMany({
    data: foundation.patients.slice(0, 10).map((patient) => ({
      campaignId: campaign.id,
      userId: patient.id,
      sentAt: new Date(),
    })),
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: foundation.patients[0]!.id,
        title: "Appointment booked",
        message: "Your appointment has been booked successfully.",
        recipient: foundation.patients[0]!.email!,
        purpose: NotificationPurpose.appointmentStatus,
        channels: [NotificationChannel.email],
        status: NotificationStatus.sent,
      },
      {
        userId: foundation.patients[1]!.id,
        title: "Appointment reminder",
        message: "Reminder: you have an appointment tomorrow.",
        recipient: foundation.patients[1]!.email!,
        purpose: NotificationPurpose.appointmentReminder,
        channels: [NotificationChannel.email],
        status: NotificationStatus.sent,
      },
      {
        userId: foundation.doctors[0]!.id,
        title: "New message",
        message: "A patient sent a message in an appointment conversation.",
        recipient: foundation.doctors[0]!.email!,
        purpose: NotificationPurpose.newChatMessage,
        channels: [NotificationChannel.email],
        status: NotificationStatus.sent,
      },
      {
        userId: foundation.patients[0]!.id,
        title: "Order shipped",
        message: "Your pharmacy order has been shipped.",
        recipient: foundation.patients[0]!.phone!,
        purpose: NotificationPurpose.orderStatus,
        channels: [NotificationChannel.sms],
        status: NotificationStatus.sent,
      },
      {
        userId: foundation.staff[0]!.id,
        title: "New patient assignment",
        message: "You have been assigned a new patient to support this week.",
        recipient: foundation.staff[0]!.email!,
        purpose: NotificationPurpose.appointmentStatus,
        channels: [NotificationChannel.email],
        status: NotificationStatus.sent,
      },
    ],
  });
}

async function seedTrafficAndLeads() {
  console.log("Seeding traffic sources, contact messages, and newsletter...");

  const traffic = await prisma.trafficSource.create({
    data: {
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "demo_launch",
      landingPage: "/",
      referrer: "https://google.com",
      ip: "203.0.113.10",
      userAgent: "Mozilla/5.0 (Demo Seed)",
    },
  });

  await prisma.contactMessage.create({
    data: {
      trafficSourceId: traffic.id,
      firstName: "Jordan",
      lastName: "Taylor",
      email: "jordan.taylor@example.com",
      phone: "+15551112222",
      subject: "Demo inquiry",
      message: "We’d like a quick demo and pricing details.",
    },
  });

  await prisma.newsletterSubscriber.create({
    data: {
      trafficSourceId: traffic.id,
      name: "Demo Subscriber",
      email: "subscriber@caresync.demo",
      isActive: true,
    },
  });
}

async function seedStaffAssignments(
  foundation: Awaited<ReturnType<typeof seedFoundation>>,
  profiles: Awaited<ReturnType<typeof seedProfiles>>,
) {
  console.log("Seeding staff assignments...");

  await prisma.staffAssignment.createMany({
    data: profiles.patients.slice(0, 6).map((patient, index) => ({
      patientId: patient.id,
      staffId: foundation.staff[index % foundation.staff.length]!.id,
      assignedById: foundation.admin.id,
      isActive: true,
      notes: "Demo caseload assignment.",
    })),
  });
}

async function main() {
  console.log("Starting Prisma PROD seed...");
  console.log(`Default seed password: ${DEFAULT_PASSWORD}`);

  await clearDatabase();

  const foundation = await seedFoundation();
  const media = await seedMedia(foundation);
  const branches = await seedBusinessAndBranches(foundation, media);
  const profiles = await seedProfiles(foundation, branches);
  await seedAvailability(profiles);
  const appointments = await seedAppointments(foundation, profiles, branches);
  await seedConversations(foundation, profiles, appointments, branches);
  await seedPayments(foundation, appointments);
  await seedCommerce(foundation);
  await seedStaffAssignments(foundation, profiles);
  await seedNotifications(foundation);
  await seedTrafficAndLeads();

  console.log("Seed completed successfully.");
  console.log("Demo logins:");
  console.log(`Admin: admin@caresync.demo / ${DEFAULT_PASSWORD}`);
  console.log(
    `Patient: patient1@caresync.demo / ${DEFAULT_PASSWORD} (and patient2..patient14)`,
  );
  console.log(
    `Doctor: dr.green@caresync.demo / ${DEFAULT_PASSWORD} (and other dr.*@caresync.demo)`,
  );
  console.log(
    `Staff: staff.quinn@caresync.demo / ${DEFAULT_PASSWORD} (and other staff.*@caresync.demo)`,
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
