"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AppointmentQueryType,
  CreateAppointmentType,
  UpdateAppointmentStatusType,
} from "@workspace/contracts/appointment";
import type { SendMessageType } from "@workspace/contracts/chat";
import type { DoctorQueryType } from "@workspace/contracts/doctor";
import type { PatientProfileType } from "@workspace/contracts/patient";
import type {
  CreatePaymentIntentType,
  PaymentQueryType,
} from "@workspace/contracts/payment";
import type {
  ProductQueryType,
  ProductResponse,
} from "@workspace/contracts/product";
import type {
  AddToCartType,
  UpdateCartItemType,
  CreateOrderType,
  GuestCheckoutType,
  OrderQueryType,
  OrderResponse,
} from "@workspace/contracts/order";
import type { ApiException } from "@workspace/sdk";
import * as appointment from "@workspace/sdk/appointment";
import * as availability from "@workspace/sdk/availability";
import * as chat from "@workspace/sdk/chat";
import * as doctor from "@workspace/sdk/doctor";
import * as patient from "@workspace/sdk/patient";
import * as payment from "@workspace/sdk/payment";
import * as product from "@workspace/sdk/product";
import * as order from "@workspace/sdk/order";
import { parseDuration } from "@workspace/shared/utils";

const STALE_TIME = parseDuration("10m");

const queryDefaults = {
  staleTime: STALE_TIME,
  gcTime: STALE_TIME,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

export function useDoctors(params: DoctorQueryType) {
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

export function useDoctor(id?: string) {
  const query = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => doctor.getDoctor(id!),
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

export function useDoctorSlots(
  doctorProfileId?: string,
  from?: string,
  to?: string,
) {
  const query = useQuery({
    queryKey: ["doctorSlots", doctorProfileId, from, to],
    queryFn: () =>
      availability.getDoctorAvailableSlots(doctorProfileId!, {
        from: from!,
        to: to!,
      }),
    select: (res) => res.data,
    placeholderData: (prev) => prev,
    enabled: Boolean(doctorProfileId && from && to),
    ...queryDefaults,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function useMyPatientProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["patient", "me"],
    queryFn: patient.getMyPatientProfile,
    select: (res) => res.data,
    staleTime: STALE_TIME,
    gcTime: STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: (data: PatientProfileType) =>
      patient.upsertMyPatientProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient", "me"] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,

    saveProfile: mutation.mutateAsync,
    isPending: mutation.isPending,
    mutateError: mutation.error as ApiException | null,
  };
}

export function useAppointments(params: AppointmentQueryType) {
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

export function useCreatePayment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreatePaymentIntentType) => payment.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  return {
    createPayment: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}

export function usePayment(id?: string) {
  const query = useQuery({
    queryKey: ["payment", id],
    queryFn: () => payment.getPayment(id!),
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

export function useConversationByAppointment(appointmentId?: string) {
  const query = useQuery({
    queryKey: ["conversation", appointmentId],
    queryFn: () => chat.getConversationByAppointment(appointmentId!),
    select: (res) => res.data,
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
    select: (res) => res.data,
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

// ── Shop ──────────────────────────────────────────────────

export function useProducts(params?: ProductQueryType) {
  const query = useQuery({
    queryKey: ["products", params],
    queryFn: () => product.listProducts(params),
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

export function useShopProduct(identifier?: string) {
  const query = useQuery({
    queryKey: ["products", identifier],
    queryFn: () => product.getProduct(identifier!),
    select: (res) => res.data as ProductResponse,
    enabled: Boolean(identifier),
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

// ── Cart ──────────────────────────────────────────────────

export function useServerCart(enabled: boolean) {
  const query = useQuery({
    queryKey: ["cart"],
    queryFn: order.getCart,
    select: (res) => res.data,
    enabled,
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}

export function useSyncLocalCart() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (items: { productId: string; quantity: number }[]) => {
      for (const item of items) {
        await order.addToCart({ productId: item.productId, quantity: item.quantity });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  return { syncCart: mutation.mutateAsync, isSyncing: mutation.isPending };
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: AddToCartType) => order.addToCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  return {
    addToCart: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: UpdateCartItemType }) =>
      order.updateCartItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  return {
    updateCartItem: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (itemId: string) => order.removeCartItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  return {
    removeCartItem: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateOrderType) => order.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return {
    placeOrder: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}

export function useGuestCheckout() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: GuestCheckoutType) => order.guestCheckout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  return {
    guestCheckout: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error as ApiException | null,
  };
}

// ── Orders ────────────────────────────────────────────────

export function useOrders(params?: OrderQueryType) {
  const query = useQuery({
    queryKey: ["orders", params],
    queryFn: () => order.listOrders(params),
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

export function useOrder(orderId?: string) {
  const query = useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => order.getOrder(orderId!),
    select: (res) => res.data as OrderResponse,
    enabled: Boolean(orderId),
    ...queryDefaults,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException | null,
  };
}
