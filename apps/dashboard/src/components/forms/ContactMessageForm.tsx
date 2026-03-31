"use client";

import { Mail, MessageSquare, Phone, UserRound } from "lucide-react";

import { ContactMessageStatusEnum, type BaseCUFormProps } from "@workspace/contracts";
import {
  updateContactMessageSchema,
  type ContactMessageResponse,
  type UpdateContactMessageType,
} from "@workspace/contracts/contact";
import {
  FormSection,
} from "@workspace/ui/components/form";
import { SelectField } from "@workspace/ui/components/select-field";
import { GenericForm } from "@workspace/ui/shared/GenericForm";

import { useContactMessage } from "@/hooks/lead";

const getContactName = (message: ContactMessageResponse) =>
  [message.firstName, message.lastName].filter(Boolean).join(" ");

const useContactMessageForm = (id?: string) => {
  const query = useContactMessage(id);

  return {
    ...query,
    mutateAsync: async (data: UpdateContactMessageType) => {
      await query.mutateAsync(data);
      return query.data as ContactMessageResponse;
    },
  };
};

const ContactMessageForm = ({ formType, entityId }: BaseCUFormProps) => (
  <GenericForm<ContactMessageResponse, UpdateContactMessageType>
    entityId={entityId}
    formType={formType}
    entityName="Contact Message"
    description="Update the follow-up status for this message."
    submitLabel="Save Status"
    schema={updateContactMessageSchema}
    useQuery={useContactMessageForm}
    mapDataToValues={(data) => ({
      status: data.status,
    })}
    defaultValues={{
      status: "pending",
    }}
    formHeader={(_, __, data) =>
      data ? (
        <FormSection
          title="Message Summary"
          description="Review the sender details before updating the status."
        >
          <div className="rounded-lg border bg-background p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserRound className="size-4" />
              Name
            </div>
            <div className="mt-2 font-medium">{getContactName(data) || "—"}</div>
          </div>
          <div className="rounded-lg border bg-background p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-4" />
              Email
            </div>
            <div className="mt-2 font-medium">{data.email}</div>
          </div>
          <div className="rounded-lg border bg-background p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-4" />
              Phone
            </div>
            <div className="mt-2 font-medium">{data.phone}</div>
          </div>
          <div className="rounded-lg border bg-background p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="size-4" />
              Subject
            </div>
            <div className="mt-2 font-medium">{data.subject ?? "—"}</div>
          </div>
          <div className="rounded-lg border bg-background p-4 md:col-span-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="size-4" />
              Message
            </div>
            <div className="mt-2 whitespace-pre-wrap text-sm leading-6">
              {data.message}
            </div>
          </div>
        </FormSection>
      ) : null
    }
  >
    {(form) => (
      <FormSection
        title="Status"
        description="Mark whether this contact message is still pending or already replied."
      >
        <SelectField
          form={form}
          name="status"
          label="Message Status"
          options={ContactMessageStatusEnum.options}
        />
      </FormSection>
    )}
  </GenericForm>
);

export default ContactMessageForm;
