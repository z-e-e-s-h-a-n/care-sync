"use client";

import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import {
  businessPhoneSchema,
  type BusinessPhone,
} from "@workspace/contracts/business";
import { InputField } from "@workspace/ui/components/input-field";
import type { ArrayFormItemProps } from "../shared/GenericArrayField";

const ContactItemField = ({
  onSubmit,
  disabled,
  editData,
  clearEditData,
  children,
}: ArrayFormItemProps<BusinessPhone>) => {
  const form = useForm({
    defaultValues: {} as BusinessPhone,
    validators: {
      onSubmit: businessPhoneSchema,
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
      <div className="grid gap-4 md:grid-cols-2">
        <InputField
          form={form}
          name="label"
          label="Label"
          placeholder="(279) 207-3379"
          disabled={disabled}
        />
        <InputField
          form={form}
          name="value"
          label="Number"
          type="tel"
          placeholder="+12345678901"
          disabled={disabled}
        />
      </div>

      {children(form.handleSubmit, handleCancel)}
    </div>
  );
};

export default ContactItemField;
