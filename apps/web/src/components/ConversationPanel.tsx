"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  useConversationByAppointment,
  useMessages,
  useSendMessage,
} from "@/hooks/healthcare";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Textarea } from "@workspace/ui/components/textarea";

interface ConversationPanelProps {
  appointmentId: string;
}

const timestampFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const ConversationPanel = ({ appointmentId }: ConversationPanelProps) => {
  const [body, setBody] = useState("");
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
    <Card className="rounded-[2rem] border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>Care conversation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-[460px] space-y-3 overflow-y-auto rounded-3xl border border-border/60 bg-muted/20 p-4">
          {messagesQuery.data.length ? (
            messagesQuery.data.map((message) => (
              <div
                key={message.id}
                className="rounded-2xl border border-border/60 bg-background px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">
                    {message.sender?.displayName ?? "Care team"}
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
              No messages yet. You can start the conversation here.
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Textarea
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Ask a follow-up question or share an update for your doctor."
          />
          <div className="flex justify-end">
            <Button onClick={submit} disabled={!conversationId || !body.trim() || isPending}>
              {isPending ? "Sending..." : "Send message"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationPanel;
