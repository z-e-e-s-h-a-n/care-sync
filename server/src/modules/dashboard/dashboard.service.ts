import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminOverview() {
    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = addDays(today, 1);
    const sevenDaysAgo = addDays(today, -7);
    const ninetyDaysAgo = addDays(today, -89);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      doctorVerifCounts,
      availableDoctors,
      branchesWithDoctors,
      patientTotal,
      patientNewThisMonth,
      patientsLast7Days,
      activeUpcomingTotal,
      todayAppointments,
      appointmentsLast90Days,
      paymentStatusCounts,
      paymentsLast7Days,
      pendingDoctorReviews,
      inactiveBranches,
      pendingPaymentSum,
      draftCampaigns,
      upcomingAppointments,
      doctorRoster,
      recentPatients,
      campaigns,
      auditLogs,
      contactMessages,
      newsletterSubscribers,
    ] = await Promise.all([
      // Doctor verification counts grouped
      this.prisma.doctorProfile.groupBy({
        by: ["verificationStatus"],
        _count: true,
      }),

      // Available doctors count
      this.prisma.doctorProfile.count({ where: { isAvailable: true } }),

      // Branches with their doctor counts (for roster bars)
      this.prisma.branch.findMany({
        where: { isActive: true, deletedAt: null },
        select: { _count: { select: { doctors: true } } },
        orderBy: { createdAt: "desc" },
        take: 7,
      }),

      // Patient total
      this.prisma.user.count({ where: { role: "patient", deletedAt: null } }),

      // New patients this month
      this.prisma.user.count({
        where: {
          role: "patient",
          deletedAt: null,
          createdAt: { gte: startOfMonth },
        },
      }),

      // Patient signups last 7 days (raw records for grouping)
      this.prisma.user.findMany({
        where: {
          role: "patient",
          deletedAt: null,
          createdAt: { gte: sevenDaysAgo },
        },
        select: { createdAt: true },
      }),

      // Active upcoming appointments count
      this.prisma.appointment.count({
        where: {
          scheduledStartAt: { gte: today },
          status: { notIn: ["cancelled", "completed", "noShow"] },
        },
      }),

      // Today's active appointment count
      this.prisma.appointment.count({
        where: {
          scheduledStartAt: { gte: today, lt: tomorrow },
          status: { notIn: ["cancelled", "completed", "noShow"] },
        },
      }),

      // Appointments last 90 days (for window chart)
      this.prisma.appointment.findMany({
        where: {
          scheduledStartAt: { gte: ninetyDaysAgo, lt: tomorrow },
          status: { notIn: ["cancelled", "noShow"] },
        },
        select: { scheduledStartAt: true },
      }),

      // Payment status grouped counts + amounts
      this.prisma.payment.groupBy({
        by: ["status"],
        _count: true,
        _sum: { amount: true },
      }),

      // Payments last 7 days for revenue trend
      this.prisma.payment.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true, status: true, amount: true },
      }),

      // Pending doctor verifications
      this.prisma.doctorProfile.count({
        where: { verificationStatus: "pending" },
      }),

      // Inactive branches
      this.prisma.branch.count({
        where: { isActive: false, deletedAt: null },
      }),

      // Pending payment value sum
      this.prisma.payment.aggregate({
        where: { status: { not: "succeeded" } },
        _sum: { amount: true },
      }),

      // Draft campaigns count
      this.prisma.notificationCampaign.count({
        where: { status: "draft" },
      }),

      // Next 6 upcoming appointments list
      this.prisma.appointment.findMany({
        where: {
          scheduledStartAt: { gte: today },
          status: { notIn: ["cancelled", "completed", "noShow"] },
        },
        orderBy: { scheduledStartAt: "asc" },
        take: 6,
        include: {
          patient: {
            include: { user: { select: { displayName: true } } },
          },
          doctor: {
            include: { user: { select: { displayName: true } } },
          },
          branch: { select: { name: true } },
        },
      }),

      // Doctor roster top 5
      this.prisma.doctorProfile.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          specialty: true,
          verificationStatus: true,
          isAvailable: true,
          user: { select: { displayName: true } },
        },
      }),

      // Recent patients top 5
      this.prisma.patientProfile.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { displayName: true, email: true, phone: true } },
        },
      }),

      // Latest 4 campaigns
      this.prisma.notificationCampaign.findMany({
        take: 4,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, status: true, audience: true },
      }),

      // Recent audit logs
      this.prisma.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          ip: true,
          createdAt: true,
          user: { select: { displayName: true } },
        },
      }),

      // Recent contact messages
      this.prisma.contactMessage.findMany({
        where: { deletedAt: null },
        take: 6,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          subject: true,
          status: true,
          createdAt: true,
        },
      }),

      // Recent newsletter subscribers
      this.prisma.newsletterSubscriber.findMany({
        where: { deletedAt: null },
        take: 6,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          subscribedAt: true,
        },
      }),
    ]);

    // Build derived values
    const verifMap = Object.fromEntries(
      doctorVerifCounts.map((r) => [r.verificationStatus, r._count]),
    );
    const doctorTotal = Object.values(verifMap).reduce((s, n) => s + n, 0);
    const branchTotal = await this.prisma.branch.count({
      where: { isActive: true, deletedAt: null },
    });
    const rosterBars = branchesWithDoctors.map((b) => b._count.doctors);

    const paymentMap = Object.fromEntries(
      paymentStatusCounts.map((r) => [
        r.status,
        { count: r._count, amount: Number(r._sum.amount ?? 0) },
      ]),
    );
    const collected = paymentMap["succeeded"]?.amount ?? 0;
    const totalPayments = paymentStatusCounts.reduce((s, r) => s + r._count, 0);
    const succeededCount = paymentMap["succeeded"]?.count ?? 0;
    const successRate = totalPayments
      ? Math.round((succeededCount / totalPayments) * 100)
      : 0;
    const pendingPaymentValue = Number(pendingPaymentSum._sum.amount ?? 0);
    const pendingRevenue = paymentStatusCounts
      .filter((r) => r.status !== "succeeded")
      .reduce((s, r) => s + Number(r._sum.amount ?? 0), 0);

    // 7-day windows
    const last7Days = buildDateRange(sevenDaysAgo, 7);
    const last90Days = buildDateRange(ninetyDaysAgo, 90);

    const growthBars = fillDailyCounts(
      last7Days,
      groupByDay(patientsLast7Days.map((r) => r.createdAt)),
    );

    const appointmentWindow = fillDailyCounts(
      last90Days,
      groupByDay(appointmentsLast90Days.map((r) => r.scheduledStartAt)),
    );

    const revenueTrend = fillDailyRevenue(
      last7Days,
      paymentsLast7Days.map((r) => ({
        date: r.createdAt,
        settled: r.status === "succeeded" ? Number(r.amount) : 0,
        pending: r.status !== "succeeded" ? Number(r.amount) : 0,
      })),
    );

    // All upcoming (queued count)
    const queuedTotal = await this.prisma.appointment.count({
      where: {
        scheduledStartAt: { gte: today },
      },
    });

    return {
      data: {
        careTeam: {
          total: doctorTotal,
          verified: verifMap["verified"] ?? 0,
          available: availableDoctors,
          branchTotal,
          rosterBars,
        },
        patientGrowth: {
          total: patientTotal,
          newThisMonth: patientNewThisMonth,
          growthBars,
        },
        upcomingVisits: {
          active: activeUpcomingTotal,
          queued: queuedTotal,
          todayCount: todayAppointments,
          window: appointmentWindow,
        },
        revenue: {
          collected,
          pending: pendingRevenue,
          successRate,
          trend: revenueTrend,
        },
        paymentStatusMix: paymentStatusCounts.map((r) => ({
          status: r.status,
          count: r._count,
        })),
        upcomingAppointments: upcomingAppointments.map((a) => ({
          id: a.id,
          scheduledStartAt: a.scheduledStartAt.toISOString(),
          status: a.status,
          patientName: a.patient.user?.displayName ?? "Patient",
          doctorName: a.doctor.user?.displayName ?? "Doctor",
          branchName: a.branch?.name ?? null,
        })),
        doctorRoster: doctorRoster.map((d) => ({
          id: d.id,
          displayName: d.user?.displayName ?? d.id,
          specialty: d.specialty,
          verificationStatus: d.verificationStatus,
          isAvailable: d.isAvailable,
        })),
        recentPatients: recentPatients.map((p) => ({
          id: p.id,
          displayName: p.user?.displayName ?? p.id,
          email: p.user?.email ?? null,
          phone: p.user?.phone ?? null,
          createdAt: p.createdAt.toISOString(),
        })),
        campaigns: campaigns.map((c) => ({
          id: c.id,
          title: c.title,
          status: c.status,
          audience: c.audience,
        })),
        auditLogs: auditLogs.map((log) => ({
          id: log.id,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          userName: log.user?.displayName,
          ip: log.ip,
          createdAt: log.createdAt,
        })),
        contactMessages: contactMessages.map((m) => ({
          id: m.id,
          firstName: m.firstName,
          lastName: m.lastName,
          email: m.email,
          phone: m.phone,
          subject: m.subject,
          status: m.status,
          createdAt: m.createdAt,
        })),
        newsletterSubscribers: newsletterSubscribers.map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          isActive: s.isActive,
          subscribedAt: s.subscribedAt,
        })),
        focus: {
          pendingDoctorReviews,
          inactiveBranches,
          pendingPaymentValue,
          draftCampaigns,
        },
      },
    };
  }

  async getDoctorOverview(userId: string) {
    const doctorProfile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { displayName: true } },
        branch: { select: { name: true } },
      },
    });

    if (!doctorProfile) {
      throw new NotFoundException("Doctor profile not found.");
    }

    const doctorId = doctorProfile.id;

    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = addDays(today, 1);
    const sevenDaysAgo = addDays(today, -7);
    const ninetyDaysAgo = addDays(today, -89);

    const [
      appointmentStatusCounts,
      activeUpcoming,
      allUpcoming,
      completedCount,
      todayCount,
      appointmentsLast90Days,
      doctorPayments,
      paymentsLast7Days,
      upcomingAppointments,
    ] = await Promise.all([
      // All appointment status counts for this doctor
      this.prisma.appointment.groupBy({
        by: ["status"],
        where: { doctorId },
        _count: true,
      }),

      // Active upcoming appointments
      this.prisma.appointment.count({
        where: {
          doctorId,
          scheduledStartAt: { gte: today },
          status: { notIn: ["cancelled", "completed", "noShow"] },
        },
      }),

      // All upcoming (any status)
      this.prisma.appointment.count({
        where: { doctorId, scheduledStartAt: { gte: today } },
      }),

      // Completed appointments
      this.prisma.appointment.count({
        where: { doctorId, status: "completed" },
      }),

      // Today's active appointments
      this.prisma.appointment.count({
        where: {
          doctorId,
          scheduledStartAt: { gte: today, lt: tomorrow },
          status: { notIn: ["cancelled", "completed", "noShow"] },
        },
      }),

      // Appointments last 90 days for window chart
      this.prisma.appointment.findMany({
        where: {
          doctorId,
          scheduledStartAt: { gte: ninetyDaysAgo, lt: tomorrow },
          status: { notIn: ["cancelled", "noShow"] },
        },
        select: { scheduledStartAt: true },
      }),

      // All payments for this doctor (through appointments)
      this.prisma.payment.findMany({
        where: { appointment: { doctorId } },
        select: { status: true, amount: true },
      }),

      // Payments last 7 days for trend
      this.prisma.payment.findMany({
        where: {
          appointment: { doctorId },
          createdAt: { gte: sevenDaysAgo },
        },
        select: { createdAt: true, status: true, amount: true },
      }),

      // Next 6 upcoming appointments list
      this.prisma.appointment.findMany({
        where: {
          doctorId,
          scheduledStartAt: { gte: today },
          status: { notIn: ["cancelled", "completed", "noShow"] },
        },
        orderBy: { scheduledStartAt: "asc" },
        take: 6,
        include: {
          patient: {
            include: { user: { select: { displayName: true } } },
          },
          doctor: {
            include: { user: { select: { displayName: true } } },
          },
          branch: { select: { name: true } },
        },
      }),
    ]);

    // Earnings aggregation
    const succeeded = doctorPayments.filter((p) => p.status === "succeeded");
    const pending = doctorPayments.filter((p) => p.status !== "succeeded");
    const earningsTotal = succeeded.reduce((s, p) => s + Number(p.amount), 0);
    const pendingTotal = pending.reduce((s, p) => s + Number(p.amount), 0);
    const earningsAverage = succeeded.length
      ? earningsTotal / succeeded.length
      : 0;

    // 7-day windows
    const last7Days = buildDateRange(sevenDaysAgo, 7);
    const last90Days = buildDateRange(ninetyDaysAgo, 90);

    const appointmentWindow = fillDailyCounts(
      last90Days,
      groupByDay(appointmentsLast90Days.map((a) => a.scheduledStartAt)),
    );

    const earningsTrend = fillDailyEarnings(
      last7Days,
      paymentsLast7Days.map((p) => ({
        date: p.createdAt,
        earned: p.status === "succeeded" ? Number(p.amount) : 0,
        expected: p.status !== "succeeded" ? Number(p.amount) : 0,
      })),
    );

    return {
      data: {
        profile: {
          displayName: doctorProfile.user?.displayName ?? "Doctor",
          specialty: doctorProfile.specialty,
          branchName: doctorProfile.branch?.name ?? null,
          consultationFee: Number(doctorProfile.consultationFee),
          bio: doctorProfile.bio,
          verificationStatus: doctorProfile.verificationStatus,
          isAvailable: doctorProfile.isAvailable,
        },
        bookingAccess: {
          todayCount,
          window: appointmentWindow,
        },
        upcomingVisits: {
          active: activeUpcoming,
          queued: allUpcoming,
          completed: completedCount,
          window: appointmentWindow,
        },
        earnings: {
          total: earningsTotal,
          pending: pendingTotal,
          average: earningsAverage,
          settledCount: succeeded.length,
          trend: earningsTrend,
        },
        appointmentStatusMix: appointmentStatusCounts.map((r) => ({
          status: r.status,
          count: r._count,
        })),
        upcomingAppointments: upcomingAppointments.map((a) => ({
          id: a.id,
          scheduledStartAt: a.scheduledStartAt.toISOString(),
          status: a.status,
          patientName: a.patient.user?.displayName ?? "Patient",
          doctorName: a.doctor.user?.displayName ?? "Doctor",
          branchName: a.branch?.name ?? null,
        })),
        focus: {
          branchName: doctorProfile.branch?.name ?? null,
          completedVisits: completedCount,
          settledPayments: succeeded.length,
          pendingPaymentValue: pendingTotal,
        },
      },
    };
  }

  async getStaffOverview(userId: string) {
    const staffProfile = await this.prisma.staffProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { displayName: true } },
        branch: { select: { name: true } },
      },
    });

    if (!staffProfile) {
      throw new NotFoundException("Staff profile not found.");
    }

    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = addDays(today, 1);
    const sevenDaysAgo = addDays(today, -6);
    const ninetyDaysAgo = addDays(today, -89);

    const activeAssignments = await this.prisma.staffAssignment.findMany({
      where: { staffId: userId, isActive: true },
      select: { patientId: true, assignedAt: true },
      orderBy: { assignedAt: "desc" },
    });

    const assignedPatientIds = activeAssignments.map((assignment) => assignment.patientId);

    const [
      appointmentsToday,
      activeUpcoming,
      completedCount,
      appointmentsLast90Days,
      assignedPatients,
      openConversations,
      orderStatusCounts,
      upcomingAppointments,
    ] = await Promise.all([
      this.prisma.appointment.count({
        where: {
          patientId: { in: assignedPatientIds.length ? assignedPatientIds : [""] },
          scheduledStartAt: { gte: today, lt: tomorrow },
          status: { notIn: ["cancelled", "completed", "noShow"] },
        },
      }),
      this.prisma.appointment.count({
        where: {
          patientId: { in: assignedPatientIds.length ? assignedPatientIds : [""] },
          scheduledStartAt: { gte: today },
          status: { notIn: ["cancelled", "completed", "noShow"] },
        },
      }),
      this.prisma.appointment.count({
        where: {
          patientId: { in: assignedPatientIds.length ? assignedPatientIds : [""] },
          status: "completed",
        },
      }),
      this.prisma.appointment.findMany({
        where: {
          patientId: { in: assignedPatientIds.length ? assignedPatientIds : [""] },
          scheduledStartAt: { gte: ninetyDaysAgo, lt: tomorrow },
          status: { notIn: ["cancelled", "noShow"] },
        },
        select: { scheduledStartAt: true },
      }),
      this.prisma.patientProfile.findMany({
        where: { id: { in: assignedPatientIds.length ? assignedPatientIds : [""] } },
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, displayName: true, email: true, phone: true } },
        },
      }),
      this.prisma.conversation.count({
        where: {
          patientId: { in: assignedPatientIds.length ? assignedPatientIds : [""] },
          status: "open",
        },
      }),
      this.prisma.order.groupBy({
        by: ["status"],
        _count: true,
      }),
      this.prisma.appointment.findMany({
        where: {
          patientId: { in: assignedPatientIds.length ? assignedPatientIds : [""] },
          scheduledStartAt: { gte: today },
          status: { notIn: ["cancelled", "completed", "noShow"] },
        },
        orderBy: { scheduledStartAt: "asc" },
        take: 6,
        include: {
          patient: {
            include: { user: { select: { displayName: true } } },
          },
          doctor: {
            include: { user: { select: { displayName: true } } },
          },
          branch: { select: { name: true } },
        },
      }),
    ]);

    const last7Days = buildDateRange(sevenDaysAgo, 7);
    const last90Days = buildDateRange(ninetyDaysAgo, 90);

    const assignmentCounts = activeAssignments.reduce(
      (acc, assignment) => {
        const key = toDateKey(assignment.assignedAt);
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const appointmentWindow = fillDailyCounts(
      last90Days,
      groupByDay(appointmentsLast90Days.map((row) => row.scheduledStartAt)),
    );

    const pendingOrders = orderStatusCounts
      .filter((row) => ["pending", "processing", "shipped"].includes(row.status))
      .reduce((sum, row) => sum + row._count, 0);

    const deliveredOrders = orderStatusCounts
      .filter((row) => row.status === "delivered")
      .reduce((sum, row) => sum + row._count, 0);

    return {
      data: {
        profile: {
          displayName: staffProfile.user?.displayName ?? "Staff",
          title: staffProfile.title,
          specialty: staffProfile.specialty ?? undefined,
          branchName: staffProfile.branch?.name ?? null,
          credentials: staffProfile.credentials,
          isActive: staffProfile.isActive,
        },
        caseload: {
          totalAssigned: activeAssignments.length,
          activePatients: assignedPatientIds.length,
          recentAssignments: fillDailyCounts(last7Days, assignmentCounts),
        },
        upcomingVisits: {
          todayCount: appointmentsToday,
          active: activeUpcoming,
          completed: completedCount,
          window: appointmentWindow,
        },
        coordination: {
          openConversations,
          pendingOrders,
          deliveredOrders,
          orderStatusMix: orderStatusCounts.map((row) => ({
            status: row.status,
            count: row._count,
          })),
        },
        upcomingAppointments: upcomingAppointments.map((a) => ({
          id: a.id,
          scheduledStartAt: a.scheduledStartAt.toISOString(),
          status: a.status,
          patientName: a.patient.user?.displayName ?? "Patient",
          doctorName: a.doctor.user?.displayName ?? "Doctor",
          branchName: a.branch?.name ?? null,
        })),
        assignedPatients: assignedPatients.map((patient) => ({
          id: patient.user?.id ?? patient.userId,
          patientId: patient.id,
          displayName: patient.user?.displayName ?? patient.id,
          email: patient.user?.email ?? null,
          phone: patient.user?.phone ?? null,
          assignedAt:
            activeAssignments.find((assignment) => assignment.patientId === patient.id)?.assignedAt.toISOString() ??
            patient.createdAt.toISOString(),
        })),
        focus: {
          branchName: staffProfile.branch?.name ?? null,
          activePatients: assignedPatientIds.length,
          openConversations,
          pendingOrders,
        },
      },
    };
  }

  async getPatientOverview(userId: string) {
    const patientProfile = await this.prisma.patientProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { displayName: true, email: true, phone: true } },
      },
    });

    if (!patientProfile) {
      throw new NotFoundException("Patient profile not found.");
    }

    const patientId = patientProfile.id;
    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = addDays(today, 1);
    const ninetyDaysAgo = addDays(today, -89);

    const [
      todayCount,
      activeUpcoming,
      completedCount,
      appointmentsLast90Days,
      upcomingAppointments,
      orders,
      notifications,
      openConversations,
    ] = await Promise.all([
      this.prisma.appointment.count({
        where: {
          patientId,
          scheduledStartAt: { gte: today, lt: tomorrow },
          status: { notIn: ["cancelled", "completed", "noShow"] },
        },
      }),
      this.prisma.appointment.count({
        where: {
          patientId,
          scheduledStartAt: { gte: today },
          status: { notIn: ["cancelled", "completed", "noShow"] },
        },
      }),
      this.prisma.appointment.count({
        where: { patientId, status: "completed" },
      }),
      this.prisma.appointment.findMany({
        where: {
          patientId,
          scheduledStartAt: { gte: ninetyDaysAgo, lt: tomorrow },
          status: { notIn: ["cancelled", "noShow"] },
        },
        select: { scheduledStartAt: true },
      }),
      this.prisma.appointment.findMany({
        where: {
          patientId,
          scheduledStartAt: { gte: today },
          status: { notIn: ["cancelled", "completed", "noShow"] },
        },
        orderBy: { scheduledStartAt: "asc" },
        take: 6,
        include: {
          patient: {
            include: { user: { select: { displayName: true } } },
          },
          doctor: {
            include: { user: { select: { displayName: true } } },
          },
          branch: { select: { name: true } },
        },
      }),
      this.prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: true },
      }),
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      this.prisma.conversation.count({
        where: { patientId, status: "open" },
      }),
    ]);

    const appointmentWindow = fillDailyCounts(
      buildDateRange(ninetyDaysAgo, 90),
      groupByDay(appointmentsLast90Days.map((row) => row.scheduledStartAt)),
    );

    const activeOrders = orders.filter((order) =>
      ["pending", "processing", "shipped"].includes(order.status),
    );
    const deliveredOrders = orders.filter((order) => order.status === "delivered");
    const totalSpent = deliveredOrders.reduce(
      (sum, order) => sum + Number(order.total),
      0,
    );
    const unreadNotifications = notifications.filter((notification) => !notification.readAt).length;
    const nextAppointmentAt = upcomingAppointments[0]?.scheduledStartAt?.toISOString();

    const statusCounts = orders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      data: {
        profile: {
          displayName: patientProfile.user?.displayName ?? "Patient",
          email: patientProfile.user?.email ?? null,
          phone: patientProfile.user?.phone ?? null,
          birthDate: patientProfile.birthDate.toISOString(),
          gender: patientProfile.gender,
        },
        upcomingVisits: {
          todayCount,
          active: activeUpcoming,
          completed: completedCount,
          window: appointmentWindow,
        },
        orders: {
          active: activeOrders.length,
          delivered: deliveredOrders.length,
          totalSpent,
          statusMix: Object.entries(statusCounts).map(([status, count]) => ({
            status,
            count,
          })),
        },
        inbox: {
          openConversations,
          unreadNotifications,
          totalNotifications: notifications.length,
        },
        upcomingAppointments: upcomingAppointments.map((a) => ({
          id: a.id,
          scheduledStartAt: a.scheduledStartAt.toISOString(),
          status: a.status,
          patientName: a.patient.user?.displayName ?? "Patient",
          doctorName: a.doctor.user?.displayName ?? "Doctor",
          branchName: a.branch?.name ?? null,
        })),
        recentOrders: orders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: Number(order.total),
          createdAt: order.createdAt.toISOString(),
          itemCount: order.items.length,
        })),
        recentNotifications: notifications.map((notification) => ({
          id: notification.id,
          title: notification.title,
          message: notification.message,
          purpose: notification.purpose,
          readAt: notification.readAt?.toISOString(),
          createdAt: notification.createdAt.toISOString(),
        })),
        focus: {
          nextAppointmentAt,
          activeOrders: activeOrders.length,
          unreadNotifications,
          totalSpent,
        },
      },
    };
  }
}

// ─── Date utilities ───────────────────────────────────────────────────────────

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildDateRange(from: Date, days: number): string[] {
  return Array.from({ length: days }, (_, i) => toDateKey(addDays(from, i)));
}

function groupByDay(dates: Date[]): Record<string, number> {
  return dates.reduce(
    (acc, d) => {
      const key = toDateKey(d);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
}

function fillDailyCounts(days: string[], counts: Record<string, number>) {
  return days.map((date) => ({ date, count: counts[date] ?? 0 }));
}

function fillDailyRevenue(
  days: string[],
  records: Array<{ date: Date; settled: number; pending: number }>,
) {
  const map: Record<string, { settled: number; pending: number }> = {};
  for (const r of records) {
    const key = toDateKey(r.date);
    if (!map[key]) map[key] = { settled: 0, pending: 0 };
    map[key]!.settled += r.settled;
    map[key]!.pending += r.pending;
  }
  return days.map((date) => ({
    date,
    settled: map[date]?.settled ?? 0,
    pending: map[date]?.pending ?? 0,
  }));
}

function fillDailyEarnings(
  days: string[],
  records: Array<{ date: Date; earned: number; expected: number }>,
) {
  const map: Record<string, { earned: number; expected: number }> = {};
  for (const r of records) {
    const key = toDateKey(r.date);
    if (!map[key]) map[key] = { earned: 0, expected: 0 };
    map[key]!.earned += r.earned;
    map[key]!.expected += r.expected;
  }
  return days.map((date) => ({
    date,
    earned: map[date]?.earned ?? 0,
    expected: map[date]?.expected ?? 0,
  }));
}
