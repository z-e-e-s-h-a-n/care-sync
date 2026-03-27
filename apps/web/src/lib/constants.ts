import {
  IconCalendarEvent,
  IconCreditCard,
  IconMessageCircle,
  IconPackage,
  IconSettings,
  IconUserCircle,
} from "@tabler/icons-react";
import type { NavGroup } from "@workspace/contracts";

export const headerMenu = [
  { href: "/", label: "Home" },
  { href: "/doctors", label: "Doctors" },
  { href: "/store", label: "Store" },
];

export const userMenu: NavGroup[] = [
  {
    items: [
      {
        href: "/user/appointments",
        label: "Appointments",
        icon: IconCalendarEvent,
      },
      { href: "/user/messages", label: "Messages", icon: IconMessageCircle },
      { href: "/user/orders", label: "Orders", icon: IconPackage },
      { href: "/user/payments", label: "Payments", icon: IconCreditCard },
    ],
  },
  {
    items: [
      { href: "/user/profile", label: "Profile", icon: IconUserCircle },
      { href: "/user/account", label: "Account", icon: IconSettings },
    ],
  },
];
