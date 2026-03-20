"use client";

import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import {
  businessAddressSchema,
  type BusinessAddress,
} from "@workspace/contracts/business";
import { InputField } from "@workspace/ui/components/input-field";
import type { ArrayFormItemProps } from "../shared/GenericArrayField";

const AddressField = ({
  onSubmit,
  disabled,
  editData,
  clearEditData,
  children,
}: ArrayFormItemProps<BusinessAddress>) => {
  const form = useForm({
    defaultValues: {} as BusinessAddress,
    validators: {
      onSubmit: businessAddressSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit?.(value);
      form.reset();
    },
  });

  useEffect(() => {
    if (editData) {
      form.reset(editData);
      clearEditData();
    }
  }, [clearEditData, editData, form]);

  const handleCancel = () => {
    form.reset();
    clearEditData();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InputField
          form={form}
          name="label"
          label="Address Label"
          placeholder="Head Office"
          disabled={disabled}
        />
        <InputField
          form={form}
          name="line1"
          label="Address Line 1"
          placeholder="Street address"
          disabled={disabled}
        />
        <InputField
          form={form}
          name="city"
          label="City"
          placeholder="City"
          disabled={disabled}
        />
        <InputField
          form={form}
          name="state"
          label="State"
          placeholder="State"
          disabled={disabled}
        />
        <InputField
          form={form}
          name="zip"
          label="ZIP Code"
          placeholder="ZIP Code"
          disabled={disabled}
        />
        <InputField
          form={form}
          name="country"
          label="Country"
          placeholder="Country"
          disabled={disabled}
        />
      </div>

      {children(form.handleSubmit, handleCancel)}
    </div>
  );
};

export default AddressField;
