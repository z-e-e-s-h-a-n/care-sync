import { ForbiddenException, Injectable } from "@nestjs/common";
import type {
  DoctorProfileDto,
  DoctorQueryDto,
  ReviewDoctorDto,
} from "@workspace/contracts/doctor";
import type { Prisma } from "@workspace/db/client";

import { AuthService } from "@/modules/auth/auth.service";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class DoctorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async create(dto: DoctorProfileDto, createdById: string) {
    const doctor = await this.prisma.doctorProfile.create({
      data: {
        ...dto,
        createdById,
      },
    });

    return { message: "Doctor profile created successfully.", data: doctor };
  }

  async list(query: DoctorQueryDto) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      searchBy,
      branchId,
      specialty,
      verificationStatus,
      isAvailable,
    } = query;

    const where: Prisma.DoctorProfileWhereInput = {};

    if (branchId) where.branchId = branchId;
    if (specialty)
      where.specialty = { contains: specialty, mode: "insensitive" };
    if (verificationStatus) where.verificationStatus = verificationStatus;
    if (isAvailable !== undefined) where.isAvailable = isAvailable;

    if (search && searchBy) {
      const searchWhereMap: Record<
        typeof searchBy,
        Prisma.DoctorProfileWhereInput
      > = {
        displayName: {
          user: { displayName: { contains: search, mode: "insensitive" } },
        },
        specialty: {
          specialty: { contains: search, mode: "insensitive" },
        },
        slug: {
          slug: { contains: search, mode: "insensitive" },
        },
        licenseNumber: {
          licenseNumber: { contains: search, mode: "insensitive" },
        },
      };

      Object.assign(where, searchWhereMap[searchBy]);
    }

    const skip = (page - 1) * limit;
    const orderBy =
      sortBy === "displayName"
        ? { user: { displayName: sortOrder } }
        : { [sortBy]: sortOrder };

    const [doctors, total] = await Promise.all([
      this.prisma.doctorProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: this.doctorInclude,
      }),
      this.prisma.doctorProfile.count({ where }),
    ]);

    return {
      message: "Doctors fetched successfully.",
      data: {
        doctors,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(identifier: string) {
    const doctor = await this.prisma.doctorProfile.findFirstOrThrow({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: this.doctorInclude,
    });

    return { message: "Doctor fetched successfully.", data: doctor };
  }

  async update(doctorId: string, dto: DoctorProfileDto) {
    const doctor = await this.prisma.doctorProfile.update({
      where: { id: doctorId },
      data: dto,
    });

    return { message: "Doctor profile updated successfully.", data: doctor };
  }

  async verify(doctorId: string, dto: ReviewDoctorDto, currentUserId: string) {
    const doctor = await this.prisma.doctorProfile.update({
      where: { id: doctorId },
      data: {
        verificationStatus: dto.verificationStatus,
        verifiedAt: dto.verificationStatus === "verified" ? new Date() : null,
        verifiedById:
          dto.verificationStatus === "verified" ? currentUserId : null,
        rejectionReason:
          dto.verificationStatus === "rejected"
            ? (dto.rejectionReason ?? "Rejected by admin review.")
            : null,
        isAvailable: dto.verificationStatus === "verified",
      },
    });

    return {
      message: "Doctor verification updated successfully.",
      data: doctor,
    };
  }

  async findByUserIdOrThrow(userId: string) {
    return this.prisma.doctorProfile.findUniqueOrThrow({
      where: { userId },
      include: this.doctorInclude,
    });
  }

  async findByUserId(userId: string) {
    const doctor = await this.findByUserIdOrThrow(userId);
    return { message: "Doctor profile fetched successfully.", data: doctor };
  }

  async assertDoctorAccess(currentUser: Express.User, doctorId: string) {
    const doctor = await this.findByUserIdOrThrow(currentUser.id);
    if (doctor.id !== doctorId) {
      throw new ForbiddenException("You can only manage your own profile.");
    }
  }

  private doctorInclude = {
    user: {
      omit: { password: true },
      include: { avatar: true },
    },
    branch: true,
    licenseDocument: true,
  } satisfies Prisma.DoctorProfileInclude;
}
