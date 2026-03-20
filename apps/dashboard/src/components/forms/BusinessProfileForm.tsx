"use client";

import { Building2, Globe, MapPin, Phone, Printer, Search } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { InputField } from "@workspace/ui/components/input-field";
import { MediaField } from "../media/mediaField";
import type { BaseCUFormProps } from "@workspace/contracts";
import { GenericForm } from "../shared/GenericForm";
import { useBusinessProfile } from "@/hooks/business";
import GenericArrayField from "../shared/GenericArrayField";
import { businessProfileSchema } from "@workspace/contracts/business";

import ContactItemField from "./ContactItemField";
import AddressField from "./AddressField";

const BusinessProfileForm = (props: BaseCUFormProps) => {
  return (
    <GenericForm
      {...props}
      entityName="Business Profile"
      description="Manage the company profile used across your platform."
      useQuery={useBusinessProfile}
      schema={businessProfileSchema}
      mapDataToValues={(data) => ({
        ...data,
        whatsapp: data.whatsapp ?? { label: "(279) 207-3379", value: "" },
        officeHoursDays: data.officeHoursDays ?? "",
        officeHoursTime: data.officeHoursTime ?? "",
        phones: data.phones ?? [],
        fax: data.fax ?? [],
        addresses: data.addresses ?? [],
      })}
      defaultValues={{
        name: "",
        legalName: "",
        description: "",
        faviconId: "",
        logoId: "",
        coverId: "",
        email: "",
        whatsapp: { label: "", value: "" },
        website: "",
        fax: [],
        phones: [],
        officeHoursDays: "",
        officeHoursTime: "",
        addresses: [],
        facebook: "https://www.facebook.com/",
        instagram: "https://www.instagram.com/",
        twitter: "https://x.com/",
        linkedin: "https://www.linkedin.com/",
        metaTitle: "",
        metaDescription: "",
      }}
    >
      {(form, _, data) => (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="size-5" />
                Core Details
              </CardTitle>
              <CardDescription>
                Basic company information and brand assets.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <InputField form={form} name="name" label="Business Name" />
                <InputField form={form} name="legalName" label="Legal Name" />
              </div>

              <InputField
                form={form}
                name="description"
                label="Description"
                type="textarea"
                rows={5}
              />

              <div className="grid gap-6 lg:grid-cols-3">
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="size-5" />
                Contact & Social
              </CardTitle>
              <CardDescription>
                Public contact points and social media links.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <InputField form={form} name="email" label="Email" type="email" />
              <InputField
                form={form}
                name="website"
                label="Website"
                type="url"
              />
              <InputField
                form={form}
                name="whatsapp.label"
                label="WhatsApp Label"
                placeholder="(279) 207-3379"
              />
              <InputField
                form={form}
                type="tel"
                name="whatsapp.value"
                label="WhatsApp Number"
                placeholder="+12345678901"
              />
              <InputField
                form={form}
                name="officeHoursDays"
                label="Hours Days"
                placeholder="Mon – Fri"
              />
              <InputField
                form={form}
                name="officeHoursTime"
                label="Hours Time"
                placeholder="9:00 AM – 6:00 PM PST"
              />
              <InputField
                form={form}
                name="facebook"
                label="Facebook"
                type="url"
              />
              <InputField
                form={form}
                name="instagram"
                label="Instagram"
                type="url"
              />
              <InputField
                form={form}
                name="twitter"
                label="Twitter / X"
                type="url"
              />
              <InputField
                form={form}
                name="linkedin"
                label="LinkedIn"
                type="url"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-5" />
                Phone, Fax & Locations
              </CardTitle>
              <CardDescription>
                Manage business phone numbers, fax numbers, and office
                locations.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <GenericArrayField
                form={form}
                name="phones"
                label={
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="size-4" />
                    Phone Numbers
                  </div>
                }
                FormItem={ContactItemField}
                columns={[
                  { header: "Label", accessor: "label" },
                  { header: "Number", accessor: "value" },
                ]}
              />

              <GenericArrayField
                form={form}
                name="fax"
                label={
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Printer className="size-4" />
                    Fax Numbers
                  </div>
                }
                FormItem={ContactItemField}
                columns={[
                  { header: "Label", accessor: "label" },
                  { header: "Number", accessor: "value" },
                ]}
              />

              <GenericArrayField
                form={form}
                name="addresses"
                label={
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="size-4" />
                    Locations
                  </div>
                }
                FormItem={AddressField}
                columns={[
                  { header: "Label", accessor: "label" },
                  { header: "Address", accessor: "line1" },
                  { header: "City", accessor: "city" },
                  { header: "ZIP", accessor: "zip" },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="size-5" />
                SEO Metadata
              </CardTitle>
              <CardDescription>
                Meta information used for search engines and link previews.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <InputField form={form} name="metaTitle" label="Meta Title" />
              <InputField
                form={form}
                name="metaDescription"
                label="Meta Description"
                type="textarea"
                rows={4}
              />
            </CardContent>
          </Card>
        </>
      )}
    </GenericForm>
  );
};

export default BusinessProfileForm;
