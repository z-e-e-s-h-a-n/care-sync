"use client";

import { Badge } from "@workspace/ui/components/badge";
import { FormSection } from "@workspace/ui/components/form";
import { InputField } from "@workspace/ui/components/input-field";
import { SwitchField } from "@workspace/ui/components/switch-field";
import { type BaseCUFormProps, WeekdayEnum } from "@workspace/contracts";
import {
  CUBranchSchema,
  type BranchResponse,
  type CUBranchType,
} from "@workspace/contracts/business";
import { GenericForm } from "@workspace/ui/shared/GenericForm";
import type { ColumnConfig } from "@workspace/ui/shared/GenericTable";
import GenericArrayField from "@workspace/ui/shared/GenericArrayField";

import { useBranch } from "@/hooks/business";
import BranchTimingField from "./BranchTimingField";

const formatWeekday = (weekday: string) =>
  weekday.charAt(0).toUpperCase() + weekday.slice(1);

const defaultBranchTimings: CUBranchType["branchTimings"] =
  WeekdayEnum.options.map((weekday) => ({
    weekday,
    openTime: "09:00",
    closeTime: "18:00",
    isClosed: false,
  }));

const timingColumns: ColumnConfig<CUBranchType["branchTimings"][number]>[] = [
  {
    header: "Day",
    accessor: (timing) => formatWeekday(timing.weekday),
  },
  {
    header: "Hours",
    accessor: (timing) =>
      timing.isClosed ? "Closed" : `${timing.openTime} - ${timing.closeTime}`,
  },
  {
    header: "Availability",
    accessor: (timing) => (
      <Badge variant={timing.isClosed ? "secondary" : "success"}>
        {timing.isClosed ? "Closed" : "Open"}
      </Badge>
    ),
  },
];

const BranchForm = ({ formType, entityId }: BaseCUFormProps) => (
  <GenericForm<BranchResponse, CUBranchType>
    entityId={entityId}
    formType={formType}
    entityName="Branch"
    description="Manage branch identity, contact details, and operating schedule."
    schema={CUBranchSchema}
    useQuery={useBranch}
    defaultValues={{
      name: "",
      slug: "",
      email: "",
      phone: "",
      whatsapp: undefined,
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      latitude: undefined,
      longitude: undefined,
      timezone: undefined,
      isActive: true,
      branchTimings: defaultBranchTimings,
    }}
    mapDataToValues={(data) => ({
      name: data.name,
      slug: data.slug,
      email: data.email,
      phone: data.phone,
      whatsapp: data.whatsapp,
      street: data.street,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      isActive: data.isActive,
      branchTimings: data.branchTimings?.length
        ? data.branchTimings
        : defaultBranchTimings,
    })}
  >
    {(form) => (
      <>
        <SwitchField
          form={form}
          name="isActive"
          label="Branch Active"
          desc="Keep this enabled while the branch is available for operations."
        />

        <FormSection
          title="Branch Information"
          description="Core identity details used across the dashboard and website."
        >
          <InputField form={form} name="name" label="Branch Name" />
          <InputField form={form} name="slug" label="Slug" />
          <InputField form={form} name="email" label="Email" type="email" />
          <InputField form={form} name="phone" label="Phone" type="tel" />
          <InputField form={form} name="whatsapp" label="WhatsApp" type="tel" />
          <InputField
            form={form}
            name="timezone"
            label="Timezone"
            placeholder="e.g. Asia/Dubai"
          />
        </FormSection>

        <FormSection
          title="Address"
          description="Public branch address and optional location details."
        >
          <InputField
            form={form}
            name="street"
            label="Street"
            className="col-span-2"
          />
          <InputField form={form} name="city" label="City" />
          <InputField form={form} name="state" label="State" />
          <InputField form={form} name="postalCode" label="Postal Code" />
          <InputField form={form} name="country" label="Country" />
          <InputField
            form={form}
            name="latitude"
            label="Latitude"
            type="number"
            min={1}
            step={1}
            handleChange={(value, commit) =>
              commit(value === "" ? undefined : Number(value))
            }
          />
          <InputField
            form={form}
            name="longitude"
            label="Longitude"
            type="number"
            min={1}
            step={1}
            handleChange={(value, commit) =>
              commit(value === "" ? undefined : Number(value))
            }
          />
        </FormSection>

        <GenericArrayField
          form={form}
          name="branchTimings"
          label="Operating Schedule"
          FormItem={BranchTimingField}
          columns={timingColumns}
        />
      </>
    )}
  </GenericForm>
);

export default BranchForm;
