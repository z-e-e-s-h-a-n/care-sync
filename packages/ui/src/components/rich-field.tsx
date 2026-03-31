"use client";

import { FormField, type BaseFieldProps } from "./form";
import { SimpleEditor } from "@workspace/ui/tiptap-templates/simple-editor";

export const RichTextField = <TFormData,>(props: BaseFieldProps<TFormData>) => {
  return (
    <FormField {...props}>
      {(field) => {
        return <SimpleEditor {...field} />;
      }}
    </FormField>
  );
};
