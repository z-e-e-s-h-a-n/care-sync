interface DashboardEmptyStateProps {
  message: string;
}

export default function DashboardEmptyState({
  message,
}: DashboardEmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}