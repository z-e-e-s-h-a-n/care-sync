"use client";

import { use, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MessageSquare,
  Send,
  User,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Textarea } from "@workspace/ui/components/textarea";
import { Separator } from "@workspace/ui/components/separator";
import SectionCard from "@workspace/ui/shared/SectionCard";
import { cn } from "@workspace/ui/lib/utils";
import {
  useAppointment,
  useConversationByAppointment,
  useMessages,
  useSendMessage,
} from "@/hooks/healthcare";
import { formatDate } from "@workspace/shared/utils";
import useUser from "@workspace/ui/hooks/use-user";

const statusConfig: Record<string, { label: string; className: string }> = {
  booked: { label: "Booked", className: "border-blue-200 bg-blue-50 text-blue-700" },
  confirmed: { label: "Confirmed", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  completed: { label: "Completed", className: "border-gray-200 bg-gray-50 text-gray-600" },
  cancelled: { label: "Cancelled", className: "border-red-200 bg-red-50 text-red-600" },
  noShow: { label: "No Show", className: "border-amber-200 bg-amber-50 text-amber-700" },
};

const paymentStatusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Payment Pending", className: "border-amber-200 bg-amber-50 text-amber-700" },
  succeeded: { label: "Paid", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  failed: { label: "Payment Failed", className: "border-red-200 bg-red-50 text-red-600" },
  refunded: { label: "Refunded", className: "border-gray-200 bg-gray-50 text-gray-600" },
};

export default function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { currentUser } = useUser();
  const { data: appt, isLoading } = useAppointment(id);
  const { data: conversation } = useConversationByAppointment(id);
  const { data: messages, isLoading: messagesLoading } = useMessages(
    conversation?.id,
  );
  const { sendMessage, isPending: isSending } = useSendMessage(conversation?.id);

  const [messageText, setMessageText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const text = messageText.trim();
    if (!text || !conversation?.id) return;
    try {
      await sendMessage({ body: text });
      setMessageText("");
      textareaRef.current?.focus();
    } catch {
      toast.error("Failed to send message.");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!appt) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed text-center">
          <CalendarDays className="size-8 text-muted-foreground" />
          <p className="font-medium">Appointment not found</p>
          <Button variant="outline" asChild>
            <Link href="/patient/appointments">Back to Appointments</Link>
          </Button>
        </div>
      </div>
    );
  }

  const status = statusConfig[appt.status] ?? statusConfig.booked;
  const paymentStatus = paymentStatusConfig[appt.paymentStatus ?? "pending"];
  const doctorName = (appt as any).doctor?.user?.displayName ?? "Doctor";

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/patient/appointments">
          <ArrowLeft className="size-4" />
          Back to Appointments
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* Details */}
        <div className="space-y-6">
          <SectionCard
            title="Appointment Details"
            contentClassName="space-y-5"
          >
            {/* Status row */}
            <div className="flex flex-wrap gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  status.className,
                )}
              >
                {status.label}
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  paymentStatus?.className,
                )}
              >
                {paymentStatus?.label}
              </span>
              <Badge variant="outline" className="capitalize text-xs">
                {appt.channel}
              </Badge>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Doctor / Therapist
                </p>
                <p className="font-medium">{doctorName}</p>
                {(appt as any).doctor?.specialty && (
                  <p className="text-sm text-muted-foreground">
                    {(appt as any).doctor.specialty}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Date & Time
                </p>
                <p className="font-medium flex items-center gap-1.5">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  {formatDate(appt.scheduledStartAt, { mode: "date" })}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  {formatDate(appt.scheduledStartAt, { mode: "time" })} —{" "}
                  {formatDate(appt.scheduledEndAt, { mode: "time" })}
                </p>
              </div>
            </div>

            {appt.patientNotes && (
              <>
                <Separator />
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Your Notes
                  </p>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {appt.patientNotes}
                  </p>
                </div>
              </>
            )}

            {(appt as any).doctorNotes && (
              <>
                <Separator />
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Therapist Notes
                  </p>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {(appt as any).doctorNotes}
                  </p>
                </div>
              </>
            )}
          </SectionCard>
        </div>

        {/* Chat */}
        <SectionCard
          title={
            <span className="flex items-center gap-2">
              <MessageSquare className="size-5" />
              Messages
            </span>
          }
          description="Chat with your therapist about this appointment."
          contentClassName="flex flex-col gap-3"
        >
          {/* Message list */}
          <div className="flex min-h-64 max-h-96 flex-col gap-3 overflow-y-auto">
            {messagesLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-10 w-3/4 rounded-2xl" />
                </div>
              ))}

            {!messagesLoading && !messages?.length && (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center py-8">
                <MessageSquare className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No messages yet. Start the conversation.
                </p>
              </div>
            )}

            {messages?.map((msg) => {
              const isMe = (msg as any).senderId === currentUser?.id;
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col gap-1",
                    isMe ? "items-end" : "items-start",
                  )}
                >
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="size-3" />
                    {isMe ? "You" : doctorName}
                    <span>·</span>
                    {formatDate((msg as any).createdAt, { mode: "time" })}
                  </div>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-secondary text-foreground rounded-tl-sm",
                    )}
                  >
                    {msg.body}
                  </div>
                </div>
              );
            })}
          </div>

          <Separator />

          {/* Input */}
          {conversation ? (
            <div className="flex gap-2 items-end">
              <Textarea
                ref={textareaRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                rows={2}
                className="resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={isSending || !messageText.trim()}
                className="shrink-0"
              >
                <Send className="size-4" />
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center">
              Messaging is available once your appointment is confirmed.
            </p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
