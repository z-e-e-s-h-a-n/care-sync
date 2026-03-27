"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  useMyPatientProfile,
  useUpsertMyPatientProfile,
} from "@/hooks/healthcare";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";

import { getPatientProfileCompletion } from "@/lib/patient";

const PatientProfileForm = () => {
  const profileQuery = useMyPatientProfile();
  const { saveProfile, isPending } = useUpsertMyPatientProfile();

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [allergies, setAllergies] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");
  const [insuranceDetails, setInsuranceDetails] = useState("");
  const [notes, setNotes] = useState("");

  const submit = async () => {
    try {
      await saveProfile({
        birthDate: dateOfBirth
          ? new Date(dateOfBirth).toISOString()
          : undefined,
        gender: gender ? (gender as "male" | "female" | "other") : undefined,
        emergencyContactName: emergencyContactName || undefined,
        emergencyContactNumber: emergencyContactPhone || undefined,
        pastMedicalHistory: medicalHistory,
        allergies: allergies,
        currentMedication: currentMedications,
      } as any);
      toast.success("Profile saved successfully.");
    } catch (error: any) {
      toast.error("Failed to save profile", {
        description:
          error?.message ?? "Please check your profile data and try again.",
      });
    }
  };

  const completion = getPatientProfileCompletion(profileQuery.data);

  return (
    <div className="space-y-6">
      <Card className="rounded-4xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Profile progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Booking readiness</span>
            <span className="font-medium">{completion.percent}% complete</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${
                completion.isReadyForBooking ? "bg-teal-600" : "bg-amber-500"
              }`}
              style={{ width: `${completion.percent}%` }}
            />
          </div>
          <p className="text-muted-foreground">
            Patients can book more smoothly once date of birth, gender, and
            emergency contact details are in place.
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-4xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Personal and emergency details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Date of birth</Label>
            <Input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Input
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              placeholder="male / female / other"
            />
          </div>
          <div className="space-y-2">
            <Label>Emergency contact name</Label>
            <Input
              value={emergencyContactName}
              onChange={(e) => setEmergencyContactName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Emergency contact phone</Label>
            <Input
              value={emergencyContactPhone}
              onChange={(e) => setEmergencyContactPhone(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-4xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Clinical profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label>Medical history JSON</Label>
            <Textarea
              rows={5}
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Allergies JSON</Label>
            <Textarea
              rows={4}
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Current medications JSON</Label>
            <Textarea
              rows={4}
              value={currentMedications}
              onChange={(e) => setCurrentMedications(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Insurance details JSON</Label>
            <Textarea
              rows={4}
              value={insuranceDetails}
              onChange={(e) => setInsuranceDetails(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={submit} disabled={isPending}>
          {isPending ? "Saving..." : "Save profile"}
        </Button>
      </div>
    </div>
  );
};

export default PatientProfileForm;
