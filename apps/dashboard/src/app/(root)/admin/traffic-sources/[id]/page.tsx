"use client";
import Link from "next/link";
import { Route } from "lucide-react";

import type { TrafficSourceResponse } from "@workspace/contracts/traffic";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { GenericDetailsPage } from "@/components/shared/GenericDetailsPage";
import { useTrafficSource } from "@/hooks/traffic";
import type { AppPageProps } from "@workspace/contracts";
import React from "react";

const TrafficSourceDetailsPage = ({ params }: AppPageProps) => {
  const { id } = React.use(params);

  return (
    <GenericDetailsPage<TrafficSourceResponse>
      entityId={id}
      entityName="traffic source"
      canEdit={false}
      useQuery={useTrafficSource}
      renderHeader={(source) => (
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-background/80 p-3">
            <Route className="size-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {source.utmCampaign ?? source.utmSource ?? "Traffic Source"}
            </h2>
            <p className="text-muted-foreground">
              {source.utmMedium ?? "Direct / Unknown"}
            </p>
          </div>
        </div>
      )}
      sections={[
        {
          title: "UTM Details",
          columns: 3,
          fields: [
            {
              label: "UTM Source",
              accessor: (source) => source.utmSource ?? "—",
            },
            {
              label: "UTM Medium",
              accessor: (source) => source.utmMedium ?? "—",
            },
            {
              label: "UTM Campaign",
              accessor: (source) => source.utmCampaign ?? "—",
            },
            { label: "UTM Term", accessor: (source) => source.utmTerm ?? "—" },
            {
              label: "UTM Content",
              accessor: (source) => source.utmContent ?? "—",
            },
            { label: "Created At", accessor: "createdAt" },
          ],
        },
        {
          title: "Request Context",
          columns: 2,
          fields: [
            { label: "Referrer", accessor: (source) => source.referrer ?? "—" },
            {
              label: "Landing Page",
              accessor: (source) => source.landingPage ?? "—",
            },
            { label: "IP Address", accessor: (source) => source.ip ?? "—" },
            {
              label: "User Agent",
              accessor: (source) => source.userAgent ?? "—",
              className: "md:col-span-2",
            },
          ],
        },
      ]}
    >
      {(source) => (
        <div className="grid gap-6">
          <RelatedListCard
            title="Contact Messages"
            columns={["Name", "Email", "Status"]}
            rows={source.contactMessages?.map((message) => ({
              id: message.id,
              href: `/admin/leads/messages/${message.id}`,
              values: [message.fullName, message.email, message.status],
            }))}
          />
          <RelatedListCard
            title="Newsletter Subscribers"
            columns={["Name", "Email", "Status"]}
            rows={source.newsletterSubs?.map((subscriber) => ({
              id: subscriber.id,
              href: `/admin/leads/subscribers/${subscriber.id}`,
              values: [
                subscriber.name,
                subscriber.email,
                subscriber.isActive ? "active" : "inactive",
              ],
            }))}
          />
        </div>
      )}
    </GenericDetailsPage>
  );
};

type RelatedListCardProps = {
  title: string;
  columns: string[];
  rows?: Array<{
    id: string;
    href?: string;
    values: string[];
  }>;
};

const RelatedListCard = ({ title, columns, rows }: RelatedListCardProps) => {
  if (!rows?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border">
          <div className="max-h-105 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="px-4 py-2 text-left font-medium"
                    >
                      {column}
                    </th>
                  ))}
                  <th className="w-24" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/50">
                    {row.values.map((value, index) => (
                      <td key={`${row.id}-${index}`} className="px-4 py-3">
                        {value}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      {row.href ? (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={row.href}>View</Link>
                        </Button>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrafficSourceDetailsPage;
