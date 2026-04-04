import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import type {
  CreatePaymentIntentDto,
  CreateRefundDto,
  PaymentQueryDto,
  UpdatePaymentStatusDto,
  UpdateRefundStatusDto,
} from "@workspace/contracts/payment";
import type { PaymentStatus, Prisma } from "@workspace/db/client";
import type Stripe from "stripe";
import StripeClient from "stripe";

import { PrismaService } from "@/modules/prisma/prisma.service";
import { EnvService } from "@/modules/env/env.service";

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly env: EnvService,
  ) {}

  async createPayment(dto: CreatePaymentIntentDto, currentUser: Express.User) {
    if (!dto.appointmentId) {
      throw new BadRequestException("Payment must target an appointment.");
    }

    const appointment = await this.prisma.appointment.findUniqueOrThrow({
      where: { id: dto.appointmentId },
      include: { patient: true, doctor: true },
    });

    if (currentUser.role === "patient") {
      const patient = await this.prisma.patientProfile.findUniqueOrThrow({
        where: { userId: currentUser.id },
      });
      if (appointment.patientId !== patient.id) {
        throw new ForbiddenException(
          "You can only pay for your own appointments.",
        );
      }
    }

    if (currentUser.role === "doctor") {
      throw new ForbiddenException(
        "Doctors cannot create appointment payments.",
      );
    }

    const existing = await this.prisma.payment.findFirst({
      where: { appointmentId: dto.appointmentId },
    });

    const payload = {
      appointmentId: dto.appointmentId,
      amount: dto.amount,
      provider: dto.provider,
      methodType: dto.methodType,
      status: "pending" as PaymentStatus,
    };

    const payment = existing
      ? await this.prisma.payment.update({
          where: { id: existing.id },
          data: payload,
        })
      : await this.prisma.payment.create({ data: payload });

    return {
      message: "Payment intent created successfully.",
      data: payment,
      meta: { targetType: "appointment", targetId: appointment.id },
    };
  }

  async createStripeOrderCheckout(orderId: string) {
    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: this.orderPaymentInclude,
    });

    if (!order.items.length) {
      throw new BadRequestException("Order has no items to pay for.");
    }

    if (!order.user.email) {
      throw new BadRequestException(
        "An email address is required to start Stripe checkout.",
      );
    }

    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        orderId: order.id,
        provider: "stripe",
      },
    });

    const payment = existingPayment
      ? await this.prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            amount: order.total,
            methodType: "card",
            status: "pending",
            failureMessage: null,
            refundedAt: null,
          },
        })
      : await this.prisma.payment.create({
          data: {
            orderId: order.id,
            amount: order.total,
            provider: "stripe",
            methodType: "card",
            status: "pending",
          },
        });

    const stripe = this.getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: `${this.env.get("CLIENT_ENDPOINT")}/checkout/success?orderId=${order.id}`,
      customer_email: order.user.email,
      metadata: {
        orderId: order.id,
        paymentId: payment.id,
      },
      payment_intent_data: {
        metadata: {
          orderId: order.id,
          paymentId: payment.id,
        },
      },
      line_items: order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(Number(item.unitPrice) * 100),
          product_data: {
            name: item.productName,
          },
        },
      })),
    });

    if (!session.client_secret) {
      throw new BadRequestException(
        "Stripe did not return a checkout session secret.",
      );
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        metadata: {
          stripeSessionId: session.id,
          stripeSessionStatus: session.status,
        },
      },
    });

    return {
      provider: "stripe" as const,
      methodType: "card" as const,
      publishableKey: this.env.get("STRIPE_PUBLISHABLE_KEY"),
      clientSecret: session.client_secret,
      sessionId: session.id,
      paymentId: payment.id,
    };
  }

  async listPayments(query: PaymentQueryDto, currentUser: Express.User) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      searchBy,
      appointmentId,
      status,
    } = query;

    const where: Prisma.PaymentWhereInput = {};

    if (appointmentId) where.appointmentId = appointmentId;
    if (status) where.status = status;

    await this.applyRoleScope(where, currentUser);

    if (search && searchBy) {
      const searchWhereMap: Record<typeof searchBy, Prisma.PaymentWhereInput> =
        {
          appointmentId: { appointmentId: search },
          status: { status: search as PaymentStatus },
          transactionId: {
            transactionId: { contains: search, mode: "insensitive" },
          },
        };

      Object.assign(where, searchWhereMap[searchBy]);
    }

    const skip = (page - 1) * limit;
    const orderBy = { [sortBy]: sortOrder };

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: this.paymentInclude,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      message: "Payments fetched successfully.",
      data: {
        payments,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPayment(paymentId: string, currentUser: Express.User) {
    const payment = await this.prisma.payment.findUniqueOrThrow({
      where: { id: paymentId },
      include: this.paymentInclude,
    });

    await this.assertPaymentAccess(payment, currentUser);

    return { message: "Payment fetched successfully.", data: payment };
  }

  async updatePaymentStatus(
    paymentId: string,
    dto: UpdatePaymentStatusDto,
    currentUser: Express.User,
  ) {
    if (currentUser.role !== "admin") {
      throw new ForbiddenException("Only admins can update payment status.");
    }

    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: dto.status,
        transactionId: dto.transactionId,
        failureMessage: dto.failureMessage,
        paidAt: dto.status === "succeeded" ? new Date() : null,
        refundedAt: dto.status === "refunded" ? new Date() : null,
      },
    });

    if (dto.status === "succeeded") {
      await this.handleSuccessfulPayment(payment);
    }

    return {
      message: "Payment status updated successfully.",
      data: payment,
    };
  }

  async handleStripeWebhook(signature: string | undefined, rawBody?: Buffer) {
    if (!signature || !rawBody) {
      throw new BadRequestException("Missing Stripe webhook signature.");
    }

    const stripe = this.getStripeClient();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.env.get("STRIPE_WEBHOOK_SECRET"),
      );
    } catch {
      throw new BadRequestException("Invalid Stripe webhook signature.");
    }

    switch (event.type) {
      case "checkout.session.completed":
        await this.handleStripeCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case "checkout.session.expired":
        await this.handleStripeCheckoutExpired(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      case "payment_intent.payment_failed":
        await this.handleStripePaymentFailed(
          event.data.object as Stripe.PaymentIntent,
        );
        break;

      default:
        break;
    }

    return { received: true };
  }

  async createRefund(dto: CreateRefundDto, currentUser: Express.User) {
    const payment = await this.prisma.payment.findUniqueOrThrow({
      where: { id: dto.paymentId },
    });

    await this.assertRefundAccess(payment, currentUser);

    const existingRefunds = await this.prisma.refund.findMany({
      where: {
        paymentId: payment.id,
        status: { in: ["pending", "processed"] },
      },
    });

    const totalRequested = existingRefunds.reduce(
      (sum, refund) => sum + Number(refund.amount),
      0,
    );

    if (totalRequested + dto.amount > Number(payment.amount)) {
      throw new BadRequestException("Refund amount exceeds paid amount.");
    }

    const refund = await this.prisma.refund.create({
      data: {
        paymentId: dto.paymentId,
        amount: dto.amount,
        reason: dto.reason,
      },
      include: this.refundInclude,
    });

    return { message: "Refund request created successfully.", data: refund };
  }

  async updateRefundStatus(
    refundId: string,
    dto: UpdateRefundStatusDto,
    currentUser: Express.User,
  ) {
    if (currentUser.role !== "admin") {
      throw new ForbiddenException("Only admins can process refunds.");
    }

    const refund = await this.prisma.refund.update({
      where: { id: refundId },
      data: {
        status: dto.status,
        reason: dto.reason,
        processedAt: dto.status === "processed" ? new Date() : null,
        processedById: currentUser.id,
      },
      include: this.refundInclude,
    });

    if (dto.status === "processed") {
      await this.handleProcessedRefund(refund);
    }

    return { message: "Refund updated successfully.", data: refund };
  }

  private async applyRoleScope(
    where: Prisma.PaymentWhereInput,
    currentUser: Express.User,
  ) {
    if (currentUser.role === "admin") return;

    if (currentUser.role === "doctor") {
      const doctor = await this.prisma.doctorProfile.findUniqueOrThrow({
        where: { userId: currentUser.id },
      });
      where.appointment = { doctorId: doctor.id };
      return;
    }

    const patient = await this.prisma.patientProfile.findUniqueOrThrow({
      where: { userId: currentUser.id },
    });

    where.OR = [
      { appointment: { patientId: patient.id } },
      { order: { userId: currentUser.id } },
    ];
  }

  private async assertPaymentAccess(payment: any, currentUser: Express.User) {
    if (currentUser.role === "admin") return;

    if (currentUser.role === "doctor") {
      const doctor = await this.prisma.doctorProfile.findUniqueOrThrow({
        where: { userId: currentUser.id },
      });
      if (payment.appointment?.doctorId !== doctor.id) {
        throw new ForbiddenException(
          "You can only view your own payment records.",
        );
      }
      return;
    }

    const patient = await this.prisma.patientProfile.findUniqueOrThrow({
      where: { userId: currentUser.id },
    });

    if (
      payment.appointment?.patientId !== patient.id &&
      payment.order?.userId !== currentUser.id
    ) {
      throw new ForbiddenException(
        "You can only view your own payment records.",
      );
    }
  }

  private async assertRefundAccess(payment: any, currentUser: Express.User) {
    if (currentUser.role === "admin") return;
    if (currentUser.role !== "patient") {
      throw new ForbiddenException(
        "Only patients or admins can request refunds.",
      );
    }

    await this.assertPaymentAccess(payment, currentUser);
  }

  private async handleSuccessfulPayment(payment: any) {
    if (payment.orderId) {
      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: {
          status: "processing",
          confirmedAt: new Date(),
        },
      });

      return;
    }

    if (!payment.appointmentId) return;

    const commissionPercent = Number(
      payment.appointment?.doctor?.commissionPercent ?? 0,
    );
    const grossAmount = Number(payment.amount);
    const commissionAmount = Number(
      ((grossAmount * commissionPercent) / 100).toFixed(2),
    );
    const doctorNetAmount = Number((grossAmount - commissionAmount).toFixed(2));

    await this.prisma.appointment.update({
      where: { id: payment.appointmentId },
      data: {
        status: "booked",
        paymentStatus: "succeeded",
        paidAt: new Date(),
      },
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { commissionAmount, doctorNetAmount },
    });
  }

  private async handleProcessedRefund(refund: any) {
    const payment = await this.prisma.payment.update({
      where: { id: refund.paymentId },
      data: { status: "refunded", refundedAt: new Date() },
      include: this.paymentInclude,
    });

    if (payment.appointmentId) {
      await this.prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: { paymentStatus: "refunded" },
      });
    }
  }

  private async handleStripeCheckoutCompleted(
    session: Stripe.Checkout.Session,
  ) {
    const paymentId = session.metadata?.paymentId;
    if (!paymentId) return;

    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "succeeded",
        transactionId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.id,
        paidAt: new Date(),
        failureMessage: null,
        metadata: {
          stripeSessionId: session.id,
          stripePaymentStatus: session.payment_status,
          stripeSessionStatus: session.status,
        },
      },
      include: this.paymentInclude,
    });

    await this.handleSuccessfulPayment(payment);
  }

  private async handleStripeCheckoutExpired(session: Stripe.Checkout.Session) {
    const paymentId = session.metadata?.paymentId;
    if (!paymentId) return;

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "failed",
        failureMessage: "Stripe checkout session expired.",
        metadata: {
          stripeSessionId: session.id,
          stripeSessionStatus: session.status,
        },
      },
    });
  }

  private async handleStripePaymentFailed(intent: Stripe.PaymentIntent) {
    const paymentId = intent.metadata.paymentId;
    if (!paymentId) return;

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "failed",
        transactionId: intent.id,
        failureMessage: intent.last_payment_error?.message,
        metadata: {
          stripePaymentIntentId: intent.id,
          stripePaymentStatus: intent.status,
        },
      },
    });
  }

  private getStripeClient() {
    return new StripeClient(this.env.get("STRIPE_SECRET_KEY"));
  }

  private paymentInclude = {
    appointment: {
      include: {
        doctor: true,
        patient: true,
      },
    },
    order: true,
    refunds: true,
  } satisfies Prisma.PaymentInclude;

  private orderPaymentInclude = {
    user: { omit: { password: true } },
    items: true,
  } satisfies Prisma.OrderInclude;

  private refundInclude = {
    payment: {
      include: this.paymentInclude,
    },
    processedBy: {
      omit: { password: true },
    },
  } satisfies Prisma.RefundInclude;
}
