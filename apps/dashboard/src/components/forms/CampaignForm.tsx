"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import {
  CampaignAudienceEnum,
  NotificationChannelEnum,
} from "@workspace/contracts";
import {
  notificationCampaignSchema,
  type NotificationCampaignType,
} from "@workspace/contracts/campaign";
import { Form, FormSection } from "@workspace/ui/components/form";
import { Button } from "@workspace/ui/components/button";
import { InputField } from "@workspace/ui/components/input-field";
import { SelectField } from "@workspace/ui/components/select-field";

import { useCreateCampaign } from "@/hooks/healthcare";

const CampaignForm = () => {
  const router = useRouter();
  const { createCampaign, isPending } = useCreateCampaign();

  const form = useForm({
    defaultValues: {
      audience: "patients",
      title: "",
      subject: "",
      message: "",
      channel: "email",
      scheduledAt: undefined,
    } as NotificationCampaignType,
    validators: {
      onSubmit: notificationCampaignSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await createCampaign(value);
        toast.success("Campaign created successfully.");
        router.push("/admin/campaigns");
      } catch (error: any) {
        toast.error("Failed to create campaign", {
          description: error?.message,
        });
      }
    },
  });

  return (
    <Form form={form}>
      <div>
        <h2 className="text-lg font-semibold">Create Campaign</h2>
        <p className="text-sm text-muted-foreground">
          Draft a notification campaign for users, patients, doctors, or admins.
        </p>
      </div>

      <FormSection title="Campaign Setup">
          <SelectField
            form={form}
            name="audience"
            label="Audience"
            options={CampaignAudienceEnum.options}
          />
          <SelectField
            form={form}
            name="channel"
            label="Channel"
            options={NotificationChannelEnum.options}
          />
          <InputField
            form={form}
            name="title"
            label="Title"
            className="md:col-span-2"
          />
          <InputField
            form={form}
            name="subject"
            label="Subject"
            className="md:col-span-2"
          />
          <InputField
            form={form}
            name="message"
            label="Message"
            type="textarea"
            className="md:col-span-2"
            rows={5}
          />
      </FormSection>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/campaigns")}
          disabled={isPending}
        >
          Cancel
        </Button>

        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit || isPending}>
              Create Campaign
            </Button>
          )}
        </form.Subscribe>
      </div>
    </Form>
  );
};

export default CampaignForm;
