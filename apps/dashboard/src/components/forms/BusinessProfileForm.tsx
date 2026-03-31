"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";

import {
  businessProfileSchema,
  type BusinessProfileType,
} from "@workspace/contracts/business";
import { Button } from "@workspace/ui/components/button";
import { Form, FormSection } from "@workspace/ui/components/form";
import { InputField } from "@workspace/ui/components/input-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { MediaField } from "@workspace/ui/media/mediaField";
import CUFormSkeleton from "@workspace/ui/skeleton/CUFormSkeleton";

import { useBusinessProfile } from "@/hooks/business";

const defaultValues: BusinessProfileType = {
  name: "",
  legalName: "",
  description: "",
  faviconId: "",
  logoId: "",
  coverId: undefined,
  email: "",
  phone: "",
  whatsapp: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  twitter: undefined,
  linkedin: undefined,
  metaTitle: "",
  metaDescription: "",
};

const BusinessProfileForm = () => {
  const { data, isLoading, fetchError, mutateAsync, isPending } =
    useBusinessProfile();

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: businessProfileSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await mutateAsync(value);
        toast.success("Business profile saved successfully.");
      } catch (error: any) {
        toast.error("Failed to save business profile.", {
          description: error?.message,
        });
      }
    },
  });

  useEffect(() => {
    form.reset(data);
  }, [data, form]);

  if (isLoading) {
    return <CUFormSkeleton />;
  }

  if (fetchError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>
            The profile could not be loaded right now.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-destructive">
          {fetchError.message}
        </CardContent>
      </Card>
    );
  }

  return (
    <Form
      form={form}
      header={
        <div>
          <h1 className="text-3xl font-bold">Business Profile</h1>
          <p className="text-muted-foreground">
            Manage the public business identity used across your dashboard and
            website.
          </p>
        </div>
      }
    >
      <FormSection
        title="Core Details"
        description="Business name, legal details, and the main profile description."
      >
        <InputField form={form} name="name" label="Business Name" />
        <InputField form={form} name="legalName" label="Legal Name" />
        <InputField
          form={form}
          name="description"
          label="Description"
          type="textarea"
          rows={5}
          className="md:col-span-2"
        />
      </FormSection>

      <FormSection
        title="Brand Media"
        description="Select the favicon, logo, and optional cover image from the media library."
        className="lg:grid-cols-3"
      >
        <MediaField
          form={form}
          name="faviconId"
          label="Favicon"
          defaultMedia={data?.favicon}
        />
        <MediaField
          form={form}
          name="logoId"
          label="Logo"
          defaultMedia={data?.logo}
        />
        <MediaField
          form={form}
          name="coverId"
          label="Cover Image"
          defaultMedia={data?.cover}
        />
      </FormSection>

      <FormSection
        title="Contact Details"
        description="Primary public contact channels for your business."
      >
        <InputField form={form} name="email" label="Email" type="email" />
        <InputField form={form} name="phone" label="Phone" type="tel" />
        <InputField form={form} name="whatsapp" label="WhatsApp" type="tel" />
        <InputField form={form} name="website" label="Website" type="url" />
      </FormSection>

      <FormSection
        title="Social Links"
        description="These links can be reused across the website and templates."
      >
        <InputField form={form} name="facebook" label="Facebook" type="url" />
        <InputField form={form} name="instagram" label="Instagram" type="url" />
        <InputField form={form} name="tiktok" label="TikTok" type="url" />
        <InputField form={form} name="twitter" label="Twitter / X" type="url" />
        <InputField form={form} name="linkedin" label="LinkedIn" type="url" />
      </FormSection>

      <FormSection
        title="SEO & Terms"
        description="Metadata and legal copy used across the business profile."
        className="md:grid-cols-1"
      >
        <InputField form={form} name="metaTitle" label="Meta Title" />
        <InputField
          form={form}
          name="metaDescription"
          label="Meta Description"
          type="textarea"
          rows={4}
        />
      </FormSection>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          disabled={isPending}
          onClick={() => form.reset(data)}
        >
          Reset
        </Button>

        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={isPending || !canSubmit}>
              {isPending ? "Saving..." : "Save Profile"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </Form>
  );
};

export default BusinessProfileForm;
