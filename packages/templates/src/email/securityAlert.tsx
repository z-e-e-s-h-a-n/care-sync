import type { EmailTemplateComponent } from "../types/global";

export const SecurityAlert: EmailTemplateComponent<"securityAlert"> = () => {
  return <div>securityAlert</div>;
};

SecurityAlert.subject = () => "";
SecurityAlert.message = () => "";
