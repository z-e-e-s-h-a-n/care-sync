import { cn } from "@workspace/ui/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  className?: string;
  align?: "default" | "center";
}

const SectionHeader = ({
  title,
  description,
  className,
  align = "default",
}: SectionHeaderProps) => {
  const isCenter = align === "center";

  return (
    <div
      className={cn(
        isCenter
          ? "flex flex-col items-center text-center gap-4"
          : "grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-end",
        className,
      )}
    >
      <h2
        className={cn(
          "max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl",
          isCenter && "mx-auto",
        )}
      >
        {title}
      </h2>

      {description && (
        <p
          className={cn(
            "max-w-xl text-sm leading-7 text-muted-foreground sm:text-base",
            isCenter && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
