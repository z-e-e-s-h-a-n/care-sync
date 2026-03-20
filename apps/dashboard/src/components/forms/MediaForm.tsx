import { useForm } from "@tanstack/react-form";

import {
  mediaUpdateSchema,
  type MediaUpdateType,
} from "@workspace/contracts/media";
import { Button } from "@workspace/ui/components/button";
import { Form } from "@workspace/ui/components/form";
import { InputField } from "@workspace/ui/components/input-field";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

interface MediaFormProps {
  media: MediaUpdateType;
  isPublic?: boolean;
  onSubmit: (data: MediaUpdateType) => void;
}

const MediaForm = ({ isPublic = true, media, onSubmit }: MediaFormProps) => {
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
      <Card>
        <CardHeader>
          <CardTitle>Media Details</CardTitle>
          <CardDescription>
            Update the file title, accessibility text, and internal notes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField form={form} name="title" label="Title" />
            {isPublic && (
              <InputField form={form} name="altText" label="Alt Text" />
            )}
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
                  <>Update Media</>
                )}
              </Button>
            )}
          </form.Subscribe>
        </CardContent>
      </Card>
    </Form>
  );
};

export default MediaForm;
