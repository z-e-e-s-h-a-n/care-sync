/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { toast } from "sonner";
import { formatDate } from "@workspace/shared/utils";

import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import SectionCard from "@workspace/ui/shared/SectionCard";

import {
  useConversationByAppointment,
  useMessages,
  useSendMessage,
} from "@/hooks/chat";

interface ConversationThreadProps {
  appointmentId: string;
}

const ConversationThread = ({ appointmentId }: ConversationThreadProps) => {
  const [body, setBody] = React.useState("");
  const conversationQuery = useConversationByAppointment(appointmentId);
  const conversationId = conversationQuery.data?.id;
  const messagesQuery = useMessages(conversationId);
  const { sendMessage, isPending } = useSendMessage(conversationId);

  const submit = async () => {
    if (!body.trim()) return;

    try {
      await sendMessage({
        body: body.trim(),
        attachmentIds: [],
      });
      setBody("");
    } catch (error: any) {
      toast.error("Failed to send message", {
        description: error?.message,
      });
    }
  };

  return (
    <SectionCard
      title="Conversation"
      className="shadow-sm"
      contentClassName="space-y-4"
    >
      <div className="max-h-105 space-y-3 overflow-y-auto rounded-xl border border-border/60 p-4">
        {messagesQuery.data.length ? (
          messagesQuery.data.map((message) => (
            <div
              key={message.id}
              className="rounded-xl border border-border/60 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">
                  {message.sender?.displayName ?? "Unknown sender"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(message.createdAt, { mode: "datetime" })}
                </p>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {message.body}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No messages yet. Start the conversation from here.
          </p>
        )}
      </div>

      <div className="space-y-3">
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Type an update for the patient..."
          rows={4}
        />
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={submit}
            disabled={!conversationId || isPending || !body.trim()}
          >
            {isPending ? "Sending..." : "Send message"}
          </Button>
        </div>
      </div>
    </SectionCard>
  );
};

export default ConversationThread;
