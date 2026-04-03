import type { AuditLogResponse } from "../audit/types";
import type { BaseUserResponse } from "../user/types";
import type { ContactMessageResponse } from "../contact/types";
import type { NewsletterSubscriberResponse } from "../newsletter/types";
import type { OrderResponse } from "../order/types";
import type { NotificationResponse } from "../notification/types";

// Shared primitives

export interface DailyCount {
  date: string;
  count: number;
}

export interface DailyRevenue {
  date: string;
  settled: number;
  pending: number;
}

export interface DailyEarnings {
  date: string;
  earned: number;
  expected: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface DashboardAppointment {
  id: string;
  scheduledStartAt: string;
  status: string;
  patientName: string;
  doctorName: string;
  branchName?: string;
}

// Admin dashboard

export interface AdminDashboardOverview {
  careTeam: {
    total: number;
    verified: number;
    available: number;
    branchTotal: number;
    rosterBars: number[];
  };
  patientGrowth: {
    total: number;
    newThisMonth: number;
    growthBars: DailyCount[];
  };
  upcomingVisits: {
    active: number;
    queued: number;
    todayCount: number;
    window: DailyCount[];
  };
  revenue: {
    collected: number;
    pending: number;
    successRate: number;
    trend: DailyRevenue[];
  };
  paymentStatusMix: StatusCount[];
  upcomingAppointments: DashboardAppointment[];
  doctorRoster: Array<{
    id: string;
    displayName: string;
    specialty: string;
    verificationStatus: string;
    isAvailable: boolean;
  }>;
  recentPatients: Array<{
    id: string;
    displayName: string;
    email?: string;
    phone?: string;
    createdAt: string;
  }>;
  campaigns: Array<{
    id: string;
    title: string;
    status: string;
    audience: string;
  }>;
  auditLogs: Array<
    Pick<
      AuditLogResponse,
      "id" | "action" | "entityType" | "entityId" | "ip" | "createdAt"
    > & {
      userName?: string;
    }
  >;
  contactMessages: Array<
    Pick<
      ContactMessageResponse,
      | "id"
      | "firstName"
      | "lastName"
      | "email"
      | "phone"
      | "subject"
      | "status"
      | "createdAt"
    >
  >;
  newsletterSubscribers: Array<
    Pick<
      NewsletterSubscriberResponse,
      "id" | "name" | "email" | "isActive" | "subscribedAt"
    >
  >;
  focus: {
    pendingDoctorReviews: number;
    inactiveBranches: number;
    pendingPaymentValue: number;
    draftCampaigns: number;
  };
}

// Doctor dashboard

export interface DoctorDashboardOverview {
  profile: {
    displayName: string;
    specialty: string;
    branchName?: string;
    consultationFee: number;
    bio?: string;
    verificationStatus: string;
    isAvailable: boolean;
  };
  bookingAccess: {
    todayCount: number;
    window: DailyCount[];
  };
  upcomingVisits: {
    active: number;
    queued: number;
    completed: number;
    window: DailyCount[];
  };
  earnings: {
    total: number;
    pending: number;
    average: number;
    settledCount: number;
    trend: DailyEarnings[];
  };
  appointmentStatusMix: StatusCount[];
  upcomingAppointments: DashboardAppointment[];
  focus: {
    branchName?: string;
    completedVisits: number;
    settledPayments: number;
    pendingPaymentValue: number;
  };
}

// Staff dashboard

export interface StaffDashboardOverview {
  profile: {
    displayName: string;
    title: string;
    specialty?: string;
    branchName?: string;
    credentials: string[];
    isActive: boolean;
  };
  caseload: {
    totalAssigned: number;
    activePatients: number;
    recentAssignments: DailyCount[];
  };
  upcomingVisits: {
    todayCount: number;
    active: number;
    completed: number;
    window: DailyCount[];
  };
  coordination: {
    openConversations: number;
    pendingOrders: number;
    deliveredOrders: number;
    orderStatusMix: StatusCount[];
  };
  upcomingAppointments: DashboardAppointment[];
  assignedPatients: Array<
    Pick<BaseUserResponse, "id" | "displayName" | "email" | "phone"> & {
      patientId: string;
      assignedAt: string;
    }
  >;
  focus: {
    branchName?: string;
    activePatients: number;
    openConversations: number;
    pendingOrders: number;
  };
}

// Patient dashboard

export interface PatientDashboardOverview {
  profile: {
    displayName: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    gender?: string;
  };
  upcomingVisits: {
    todayCount: number;
    active: number;
    completed: number;
    window: DailyCount[];
  };
  orders: {
    active: number;
    delivered: number;
    totalSpent: number;
    statusMix: StatusCount[];
  };
  inbox: {
    openConversations: number;
    unreadNotifications: number;
    totalNotifications: number;
  };
  upcomingAppointments: DashboardAppointment[];
  recentOrders: Array<
    Pick<OrderResponse, "id" | "orderNumber" | "status" | "total" | "createdAt"> & {
      itemCount: number;
    }
  >;
  recentNotifications: Array<
    Pick<
      NotificationResponse,
      "id" | "title" | "message" | "purpose" | "readAt" | "createdAt"
    >
  >;
  focus: {
    nextAppointmentAt?: string;
    activeOrders: number;
    unreadNotifications: number;
    totalSpent: number;
  };
}
