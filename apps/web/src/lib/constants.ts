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
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/doctors", label: "Doctors" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
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
