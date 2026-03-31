/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import type {
  AvailabilityRuleType,
  AvailabilityScheduleType,
  BlockedTimeType,
} from "@workspace/contracts/availability";
import SectionCard from "@workspace/ui/shared/SectionCard";

import { useReplaceDoctorAvailability } from "@/hooks/healthcare";

const weekdays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

interface AvailabilityEditorProps {
  doctorId: string;
  initialValue?: AvailabilityScheduleType;
}

const AvailabilityEditor = ({
  doctorId,
  initialValue,
}: AvailabilityEditorProps) => {
  const [rules, setRules] = React.useState<AvailabilityRuleType[]>(
    initialValue?.rules?.length
      ? initialValue.rules
      : weekdays.map((weekday) => ({
          weekday,
          startTime: "09:00",
          endTime: "17:00",
          slotDurationMinute: 30,
          isActive: weekday !== "saturday" && weekday !== "sunday",
        })),
  );
  const [blockedTimes, setBlockedTimes] = React.useState<BlockedTimeType[]>(
    initialValue?.blockedTimes ?? [],
  );

  const { replaceAvailability, isPending } =
    useReplaceDoctorAvailability(doctorId);

  const updateRule = (
    weekday: AvailabilityRuleType["weekday"],
    patch: Partial<AvailabilityRuleType>,
  ) => {
    setRules((current) =>
      current.map((rule) =>
        rule.weekday === weekday ? { ...rule, ...patch } : rule,
      ),
    );
  };

  const addBlockedTime = () => {
    setBlockedTimes((current) => [
      ...current,
      {
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        reason: "",
      },
    ]);
  };

  const updateBlockedTime = (
    index: number,
    patch: Partial<BlockedTimeType>,
  ) => {
    setBlockedTimes((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  };

  const removeBlockedTime = (index: number) => {
    setBlockedTimes((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const submit = async () => {
    try {
      await replaceAvailability({
        rules,
        blockedTimes,
      });
      toast.success("Availability updated.");
    } catch (error: any) {
      toast.error("Failed to update availability", {
        description: error?.message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Weekly schedule"
        className="shadow-sm"
        contentClassName="space-y-4"
      >
        {rules.map((rule) => (
          <div
            key={rule.weekday}
            className="grid gap-4 rounded-xl border border-border/60 p-4 lg:grid-cols-[160px_1fr_1fr_160px]"
          >
            <div className="flex items-center justify-between lg:block">
              <div>
                <p className="font-medium capitalize">{rule.weekday}</p>
                <p className="text-xs text-muted-foreground">Doctor slots</p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={rule.isActive}
                  onChange={(event) =>
                    updateRule(rule.weekday, {
                      isActive: event.target.checked,
                    })
                  }
                />
                Active
              </label>
            </div>
            <div className="space-y-2">
              <Label>Start time</Label>
              <Input
                type="time"
                value={rule.startTime}
                onChange={(event) =>
                  updateRule(rule.weekday, { startTime: event.target.value })
                }
                disabled={!rule.isActive}
              />
            </div>
            <div className="space-y-2">
              <Label>End time</Label>
              <Input
                type="time"
                value={rule.endTime}
                onChange={(event) =>
                  updateRule(rule.weekday, { endTime: event.target.value })
                }
                disabled={!rule.isActive}
              />
            </div>
            <div className="space-y-2">
              <Label>Slot minutes</Label>
              <Input
                type="number"
                min={5}
                value={Number(rule.slotDurationMinute ?? 30)}
                onChange={(event) =>
                  updateRule(rule.weekday, {
                    slotDurationMinute: Number(event.target.value || 30),
                  })
                }
                disabled={!rule.isActive}
              />
            </div>
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Blocked time"
        action={
          <Button type="button" variant="outline" onClick={addBlockedTime}>
            Add block
          </Button>
        }
        className="shadow-sm"
        contentClassName="space-y-4"
      >
        {blockedTimes.length ? (
          blockedTimes.map((blockedTime, index) => (
            <div
              key={`${blockedTime.startAt}-${index}`}
              className="grid gap-4 rounded-xl border border-border/60 p-4 lg:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <div className="space-y-2">
                <Label>Start</Label>
                <Input
                  type="datetime-local"
                  value={String(blockedTime.startAt ?? "").slice(0, 16)}
                  onChange={(event) =>
                    updateBlockedTime(index, {
                      startAt: new Date(event.target.value).toISOString(),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End</Label>
                <Input
                  type="datetime-local"
                  value={String(blockedTime.endAt ?? "").slice(0, 16)}
                  onChange={(event) =>
                    updateBlockedTime(index, {
                      endAt: new Date(event.target.value).toISOString(),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Input
                  value={blockedTime.reason ?? ""}
                  onChange={(event) =>
                    updateBlockedTime(index, { reason: event.target.value })
                  }
                  placeholder="Vacation, surgery, conference..."
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeBlockedTime(index)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No blocked dates yet. Add breaks, vacations, or manual holds here.
          </p>
        )}
      </SectionCard>

      <div className="flex justify-end">
        <Button type="button" onClick={submit} disabled={isPending}>
          {isPending ? "Saving..." : "Save availability"}
        </Button>
      </div>
    </div>
  );
};

export default AvailabilityEditor;
