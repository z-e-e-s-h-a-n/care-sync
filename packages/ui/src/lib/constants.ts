import {
  IconPhoto,
  IconHistory,
  IconCalendarTime,
  IconCreditCard,
  IconHeartHandshake,
  IconMessageCircle,
  IconSpeakerphone,
  IconStethoscope,
  IconClockHour4,
  IconUserCircle,
  IconUsersGroup,
  IconMapPin,
  IconSettings,
  IconRoute,
  IconAddressBook,
  IconCalendarEvent,
  IconNotification,
} from "@tabler/icons-react";
import type { NavGroup, UserRole } from "@workspace/contracts";

export const adminSidebarMenu: NavGroup[] = [
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
        href: "/admin/users",
        icon: IconUsersGroup,
      },
      {
        label: "Media",
        href: "/media",
        icon: IconPhoto,
      },
    ],
  },
  {
    groupLabel: "MANAGEMENT",
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
      {
        label: "Leads",
        icon: IconAddressBook,
        children: [
          {
            label: "Contact Messages",
            href: "/admin/leads/messages",
          },
          {
            label: "Newsletter",
            href: "/admin/leads/subscribers",
          },
        ],
      },
      {
        label: "Traffic Sources",
        href: "/admin/traffic-sources",
        icon: IconRoute,
      },
      {
        label: "Audit Logs",
        href: "/admin/audit-logs",
        icon: IconHistory,
      },
    ],
  },
  {
    items: [
      {
        label: "Branches",
        href: "/admin/branches",
        icon: IconMapPin,
      },
      {
        label: "Business Profile",
        href: "/admin/business-profile",
        icon: IconSettings,
      },
    ],
  },
];

export const doctorSidebarMenu: NavGroup[] = [
  {
    items: [
      {
        label: "Patients",
        href: "/doctor/patients",
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

export const userSidebarMenu: NavGroup[] = [
  {
    items: [
      {
        href: "/patient/appointments",
        label: "Appointments",
        icon: IconCalendarEvent,
      },
      { href: "/patient/messages", label: "Messages", icon: IconMessageCircle },
      { href: "/patient/payments", label: "Payments", icon: IconCreditCard },
    ],
  },
  {
    items: [
      { href: "/patient/profile", label: "Profile", icon: IconUserCircle },
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

export const getSidebarMenu = (role: UserRole): NavGroup[] => {
  switch (role) {
    case "admin":
      return adminSidebarMenu;

    case "doctor":
      return doctorSidebarMenu;

    case "patient":
      return userSidebarMenu;

    default:
      throw new Error("Invalid Role");
  }
};
