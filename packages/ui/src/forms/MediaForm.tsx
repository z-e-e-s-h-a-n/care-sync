import { useForm } from "@tanstack/react-form";

import {
  mediaUpdateSchema,
  type MediaUpdateType,
} from "@workspace/contracts/media";
import { Button } from "@workspace/ui/components/button";
import { Form, FormSection } from "@workspace/ui/components/form";
import { InputField } from "@workspace/ui/components/input-field";
import { Loader2 } from "lucide-react";

interface MediaFormProps {
  media: MediaUpdateType;
  isPublic?: boolean;
  title?: string;
  description?: string;
  submitLabel?: string;
  onSubmit: (data: MediaUpdateType) => void;
}

const MediaForm = ({
  isPublic = true,
  media,
  title = "Media Details",
  description = "Update the file name, accessibility text, and internal notes.",
  submitLabel = "Update Media",
  onSubmit,
}: MediaFormProps) => {
  const form = useForm({
    defaultValues: media,
    validators: {
      onSubmit: mediaUpdateSchema,
    },
    onSubmit: ({ value }) => {
      onSubmit(value);
    },
  });

  return (
    <Form form={form}>
      <FormSection
        title={title}
        description={description}
        className="md:grid-cols-1"
      >
        <div className="grid grid-cols-2 gap-4">
          <InputField form={form} name="name" label="Name" />
          {isPublic && <InputField form={form} name="altText" label="Alt Text" />}
        </div>
        <InputField form={form} name="notes" type="textarea" label="Notes" />

        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button
              type="submit"
              size="lg"
              className="w-full text-base"
              disabled={isSubmitting || !canSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>{submitLabel}</>
              )}
            </Button>
          )}
        </form.Subscribe>
      </FormSection>
    </Form>
  );
};

export default MediaForm;
