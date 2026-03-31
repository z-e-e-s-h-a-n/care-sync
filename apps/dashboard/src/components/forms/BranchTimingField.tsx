"use client";

import { useEffect } from "react";
import { useForm, useStore } from "@tanstack/react-form";

import {
  branchTimingSchema,
  type CUBranchType,
} from "@workspace/contracts/business";
import { InputField } from "@workspace/ui/components/input-field";
import { SelectField } from "@workspace/ui/components/select-field";
import { SwitchField } from "@workspace/ui/components/switch-field";
import type { ArrayFormItemProps } from "@workspace/ui/shared/GenericArrayField";
import { WeekdayEnum } from "@workspace/contracts";

type BranchTimingType = CUBranchType["branchTimings"][number];

const BranchTimingField = ({
  onSubmit,
  children,
  editData,
  clearEditData,
}: ArrayFormItemProps<BranchTimingType>) => {
  const form = useForm({
    defaultValues: {
      weekday: "monday",
      openTime: "09:00",
      closeTime: "18:00",
      isClosed: false,
    } as BranchTimingType,
    validators: {
      onSubmit: branchTimingSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit?.(value);
    },
  });

  const isClosed = useStore(form.store, (state) => state.values.isClosed);

  useEffect(() => {
    if (editData) {
      form.reset(editData);
      clearEditData();
    }
  }, [clearEditData, editData, form]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <SelectField
          form={form}
          name="weekday"
          label="Weekday"
          options={WeekdayEnum.options}
        />
        <InputField
          form={form}
          name="openTime"
          type="time"
          label="Open Time"
          disabled={isClosed}
        />
        <InputField
          form={form}
          name="closeTime"
          type="time"
          label="Close Time"
          disabled={isClosed}
        />
      </div>

      <SwitchField
        form={form}
        name="isClosed"
        label="Closed Day"
        desc="Enable this when the branch does not operate on the selected day."
      />

      {children(form.handleSubmit, clearEditData)}
    </div>
  );
};

export default BranchTimingField;
