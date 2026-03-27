import {
  IconDashboard,
  IconPhoto,
  IconHistory,
  IconCalendarTime,
  IconCreditCard,
  IconHeartHandshake,
  IconMessageCircle,
  IconSpeakerphone,
  IconStethoscope,
  IconBuildingHospital,
  IconClockHour4,
  IconUserCircle,
  IconUsersGroup,
  IconNotification,
} from "@tabler/icons-react";
import type { NavGroup } from "@workspace/contracts";

export const adminSidebarMenu: NavGroup[] = [
  {
    items: [
      {
        label: "Overview",
        href: "/admin",
        icon: IconDashboard,
      },
    ],
  },
  {
    groupLabel: "CARE OPERATIONS",
    items: [
      {
        label: "Doctors",
        href: "/admin/doctors",
        icon: IconStethoscope,
      },
      {
        label: "Patients",
        href: "/admin/patients",
        icon: IconHeartHandshake,
      },
      {
        label: "Appointments",
        href: "/admin/appointments",
        icon: IconCalendarTime,
      },
      {
        label: "Users",
        href: "/users",
        icon: IconUsersGroup,
      },
      {
        label: "Branches",
        href: "/admin/branches",
        icon: IconBuildingHospital,
      },
    ],
  },
  {
    groupLabel: "REVENUE",
    items: [
      {
        label: "Payments",
        href: "/admin/payments",
        icon: IconCreditCard,
      },
      {
        label: "Campaigns",
        href: "/admin/campaigns",
        icon: IconSpeakerphone,
      },
    ],
  },
  {
    groupLabel: "SYSTEM",
    items: [
      {
        label: "Media",
        href: "/media",
        icon: IconPhoto,
      },
      {
        label: "Audit Logs",
        href: "/admin/audit-logs",
        icon: IconHistory,
      },
    ],
  },
];

export const doctorSidebarMenu: NavGroup[] = [
  {
    items: [
      {
        label: "Overview",
        href: "/doctor",
        icon: IconDashboard,
      },
    ],
  },
  {
    items: [
      {
        label: "Patients",
        href: "/users",
        icon: IconUsersGroup,
      },
      {
        label: "Appointments",
        href: "/doctor/appointments",
        icon: IconCalendarTime,
      },
      {
        label: "Messages",
        href: "/doctor/messages",
        icon: IconMessageCircle,
      },
      {
        label: "Profile",
        href: "/doctor/profile",
        icon: IconUserCircle,
      },
      {
        label: "Availability",
        href: "/doctor/availability",
        icon: IconClockHour4,
      },
    ],
  },
  {
    groupLabel: "System",
    items: [
      {
        label: "Media",
        href: "/media",
        icon: IconPhoto,
      },
    ],
  },
];

export const footerSidebarMenu: NavGroup[] = [
  {
    items: [
      {
        label: "Account",
        href: "/account",
        icon: IconUserCircle,
      },
      {
        label: "Notifications",
        href: "/notifications",
        icon: IconNotification,
      },
    ],
  },
];

export const getSidebarMenu = (role?: string): NavGroup[] =>
  role === "doctor" ? doctorSidebarMenu : adminSidebarMenu;
