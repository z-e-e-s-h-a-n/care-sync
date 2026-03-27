/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Textarea } from "@workspace/ui/components/textarea";

import {
  useConversationByAppointment,
  useMessages,
  useSendMessage,
} from "@/hooks/healthcare";

interface ConversationThreadProps {
  appointmentId: string;
}

const timestampFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

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
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Conversation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
                    {timestampFormatter.format(new Date(message.createdAt))}
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
      </CardContent>
    </Card>
  );
};

export default ConversationThread;
