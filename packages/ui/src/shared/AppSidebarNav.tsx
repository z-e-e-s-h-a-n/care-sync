"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@workspace/ui/components/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import type { NavGroup } from "@workspace/contracts";

interface SidebarNavProps {
  closeSidebar: () => void;
  groups: NavGroup[];
  pathname: string;
}

const SidebarNav = ({ closeSidebar, groups, pathname }: SidebarNavProps) => {
  return groups.map(({ items, groupLabel }, i) => (
    <SidebarGroup
      key={i}
      className={cn(i === groups.length - 1 ? "mt-auto" : "")}
    >
      <SidebarGroupContent className="flex flex-col gap-2">
        {groupLabel && <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>}
        <SidebarMenu>
          {items.map((item) => (
            <Collapsible
              key={item.label}
              asChild
              defaultOpen={false}
              className="group/collapsible"
            >
              <SidebarMenuItem key={item.label}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.label}
                    className={cn(
                      pathname === item.href &&
                        "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear",
                    )}
                    asChild
                  >
                    {item.children ? (
                      <div className="cursor-pointer">
                        {item.icon && <item.icon />}
                        <span>{item.label}</span>
                        {item.children && (
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        )}
                      </div>
                    ) : (
                      <Link href={item.href!} onClick={closeSidebar}>
                        {item.icon && <item.icon />}
                        <span>{item.label}</span>
                        {item.children && (
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        )}
                      </Link>
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {item.children && (
                    <SidebarMenuSub>
                      {item.children.map((i) => (
                        <SidebarMenuSubItem key={i.label}>
                          <SidebarMenuSubButton asChild>
                            <Link href={i.href || ""} onClick={closeSidebar}>
                              <span>{i.label}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  ));
};

export default SidebarNav;
