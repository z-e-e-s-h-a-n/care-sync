"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateAppointmentType,
  AppointmentQueryType,
  AppointmentResponse,
  UpdateAppointmentStatusType,
} from "@workspace/contracts/appointment";
import type {
  AvailabilityScheduleType,
  AvailabilityRuleResponse,
  BlockedTimeResponse,
} from "@workspace/contracts/availability";
import type { CampaignQueryType } from "@workspace/contracts/campaign";
import type {
  NotificationCampaignResponse,
  UpdateCampaignStatusType,
} from "@workspace/contracts/campaign";
import type {
  ConversationResponse,
  MessageResponse,
  SendMessageType,
} from "@workspace/contracts/chat";
import type {
  DoctorQueryType,
  DoctorProfileResponse,
  ReviewDoctorType,
  DoctorProfileType,
} from "@workspace/contracts/doctor";
import type {
  PatientProfileType,
  PatientQueryType,
} from "@workspace/contracts/patient";
import type { PaymentQueryType } from "@workspace/contracts/payment";
import type {
  CreateRefundType,
  PaymentResponse,
  UpdatePaymentStatusType,
} from "@workspace/contracts/payment";
import type { ApiException } from "@workspace/sdk";
import * as appointment from "@workspace/sdk/appointment";
import * as availability from "@workspace/sdk/availability";
import * as campaign from "@workspace/sdk/campaign";
import * as chat from "@workspace/sdk/chat";
import * as doctor from "@workspace/sdk/doctor";
import * as patient from "@workspace/sdk/patient";
import * as payment from "@workspace/sdk/payment";
import { parseDuration } from "@workspace/shared/utils";

const STALE_TIME = parseDuration("10m");

const queryDefaults = {
  staleTime: STALE_TIME,
  gcTime: STALE_TIME,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

export function useDoctors(params?: DoctorQueryType) {
  const query = useQuery({
    queryKey: ["doctors", params],
    queryFn: () => doctor.listDoctors(params),
    select: (res) => res.data,
    placeholderData: (prev) => prev,
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function useMyDoctorProfile() {
  const query = useQuery({
    queryKey: ["doctor", "me"],
    queryFn: doctor.getMyDoctorProfile,
    select: (res) => res.data as DoctorProfileResponse,
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function useDoctor(id?: string) {
  const query = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => doctor.getDoctor(id!),
    select: (res) => res.data as DoctorProfileResponse,
    enabled: Boolean(id),
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function usePatients(params?: PatientQueryType) {
  const query = useQuery({
    queryKey: ["patients", params],
    queryFn: () => patient.listPatients(params),
    select: (res) => res.data,
    placeholderData: (prev) => prev,
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function usePatient(id?: string) {
  const query = useQuery({
    queryKey: ["patient", id],
    queryFn: () => patient.getPatient(id!),
    select: (res) => res.data,
    enabled: Boolean(id),
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function useSavePatient(id?: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: PatientProfileType) =>
      id ? patient.updatePatient(id, data) : patient.createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", id] });
    },
  });

  return {
    savePatient: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}

export function useAppointments(params?: AppointmentQueryType) {
  const query = useQuery({
    queryKey: ["appointments", params],
    queryFn: () => appointment.listAppointments(params),
    select: (res) => res.data,
    placeholderData: (prev) => prev,
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function useAppointment(id?: string) {
  const query = useQuery({
    queryKey: ["appointment", id],
    queryFn: () => appointment.getAppointment(id!),
    select: (res) => res.data as AppointmentResponse,
    enabled: Boolean(id),
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function useUpdateAppointmentStatus(id?: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: UpdateAppointmentStatusType) =>
      appointment.updateAppointmentStatus(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment", id] });
    },
  });

  return {
    updateStatus: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateAppointmentType) =>
      appointment.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  return {
    createAppointment: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}

export function usePayments(params: PaymentQueryType) {
  const query = useQuery({
    queryKey: ["payments", params],
    queryFn: () => payment.listPayments(params),
    select: (res) => res.data,
    placeholderData: (prev) => prev,
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function usePayment(id?: string) {
  const query = useQuery({
    queryKey: ["payment", id],
    queryFn: () => payment.getPayment(id!),
    select: (res) => res.data as PaymentResponse,
    enabled: Boolean(id),
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function useCampaigns(params: CampaignQueryType) {
  const query = useQuery({
    queryKey: ["campaigns", params],
    queryFn: () => campaign.listCampaigns(params),
    select: (res) => res.data,
    placeholderData: (prev) => prev,
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function useCampaign(id?: string) {
  const query = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => campaign.getCampaign(id!),
    select: (res) => res.data as NotificationCampaignResponse,
    enabled: Boolean(id),
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function useDoctorAvailability(doctorId?: string) {
  const query = useQuery({
    queryKey: ["doctorAvailability", doctorId],
    queryFn: () => availability.getDoctorAvailability(doctorId!),
    select: (res) => res.data,
    enabled: Boolean(doctorId),
    ...queryDefaults,
  });

  return {
    data: query.data as
      | {
          rules: AvailabilityRuleResponse[];
          blockedTimes: BlockedTimeResponse[];
        }
      | undefined,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function useReplaceDoctorAvailability(doctorId?: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: AvailabilityScheduleType) =>
      availability.replaceDoctorAvailability(doctorId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["doctorAvailability", doctorId],
      });
    },
  });

  return {
    replaceAvailability: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}

export function useConversationByAppointment(appointmentId?: string) {
  const query = useQuery({
    queryKey: ["conversation", appointmentId],
    queryFn: () => chat.getConversationByAppointment(appointmentId!),
    select: (res) => res.data as ConversationResponse,
    enabled: Boolean(appointmentId),
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function useMessages(conversationId?: string) {
  const query = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => chat.listMessages(conversationId!),
    select: (res) => res.data as MessageResponse[],
    enabled: Boolean(conversationId),
    ...queryDefaults,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function useSendMessage(conversationId?: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: Omit<SendMessageType, "conversationId">) =>
      chat.sendMessage({
        conversationId: conversationId!,
        body: data.body,
        attachmentIds: data.attachmentIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    },
  });

  return {
    sendMessage: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}

export function useVerifyDoctor(id?: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: ReviewDoctorType) => doctor.verifyDoctor(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor", id] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });

  return {
    verifyDoctor: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}

export function useSaveDoctor(id?: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: DoctorProfileType) =>
      id ? doctor.updateDoctor(id, data) : doctor.createDoctor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor", id] });
    },
  });

  return {
    saveDoctor: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}

export function useUpdateCampaign(id?: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: UpdateCampaignStatusType) =>
      campaign.updateCampaignStatus(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: () => campaign.sendCampaign(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
    },
  });

  return {
    updateCampaignStatus: mutation.mutateAsync,
    sendCampaign: sendMutation.mutateAsync,
    isPending: mutation.isPending || sendMutation.isPending,
    error:
      (mutation.error as ApiException | null) ??
      (sendMutation.error as ApiException | null),
  };
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: campaign.createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });

  return {
    createCampaign: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}

export function useUpdatePayment(id?: string) {
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (data: UpdatePaymentStatusType) =>
      payment.updatePaymentStatus(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment", id] });
    },
  });

  const refundMutation = useMutation({
    mutationFn: (data: CreateRefundType) => payment.createRefund(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment", id] });
    },
  });

  return {
    updatePaymentStatus: statusMutation.mutateAsync,
    createRefund: refundMutation.mutateAsync,
    isPending: statusMutation.isPending || refundMutation.isPending,
    error:
      (statusMutation.error as ApiException | null) ??
      (refundMutation.error as ApiException | null),
  };
}
