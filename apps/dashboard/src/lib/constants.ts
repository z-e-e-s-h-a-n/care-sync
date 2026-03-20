import {
  IconDashboard,
  IconUsers,
  IconSettings,
  type Icon,
  IconPhoto,
  IconRoute,
  IconHistory,
  IconAddressBook,
} from "@tabler/icons-react";

export type NavItem = {
  title: string;
  url?: string;
  icon?: Icon;
  children?: NavItem[];
};

export interface NavGroup {
  groupLabel?: string;
  items: NavItem[];
}

export const sidebarMenu: NavGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: IconDashboard,
      },
    ],
  },

  {
    groupLabel: "MANAGEMENT",
    items: [
      {
        title: "Leads",
        icon: IconAddressBook,
        children: [
          {
            title: "Newsletter",
            url: "/admin/leads/subscribers",
          },
        ],
      },

      {
        title: "Users",
        icon: IconUsers,
        children: [
          { title: "Users", url: "/admin/users" },
          { title: "Add User", url: "/admin/users/new" },
        ],
      },

      {
        title: "Media",
        url: "/media",
        icon: IconPhoto,
      },

      {
        title: "Traffic Sources",
        url: "/admin/traffic-sources",
        icon: IconRoute,
      },

      {
        title: "Audit Logs",
        url: "/admin/audit-logs",
        icon: IconHistory,
      },
    ],
  },

  {
    items: [
      {
        title: "Business Profile",
        url: "/settings",
        icon: IconSettings,
      },
    ],
  },
];
