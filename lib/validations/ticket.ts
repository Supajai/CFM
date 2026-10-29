// lib/validations/ticket.ts
import { z } from "zod";
import { Category, Priority, TicketStatus } from "@prisma/client";

export const createTicketSchema = z.object({
  category: z.nativeEnum(Category, {
    errorMap: () => ({ message: "กรุณาเลือกหมวดหมู่ปัญหา" }),
  }),
  building: z.string().optional().default("อาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์"),
  floor: z.coerce.number().int().min(1).max(4).optional().default(1),
  room: z.string().min(1, "กรุณาระบุห้องหรือจุดเกิดเหตุที่ชัดเจน"),
  roomName: z.string().optional(),
  specificPoint: z.string().optional(), // เช่น โต๊ะคอมเครื่องที่ 12
  specificLocation: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  gpsAccuracy: z.number().optional().nullable(),
  description: z
    .string()
    .min(10, "กรุณากรอกรายละเอียดอาการและปัญหาอย่างน้อย 10 ตัวอักษร"),
  isUrgent: z.boolean().optional().default(false),
  priority: z.nativeEnum(Priority).optional().default(Priority.NORMAL),
  title: z.string().optional(),
  reporterName: z.string().optional(),
  beforeImageUrl: z.string().optional(),
  afterImageUrl: z.string().optional(),
  resolutionDetail: z.string().optional(),
  attachments: z
    .array(
      z.object({
        fileName: z.string(),
        fileSize: z.string().optional(),
        fileType: z.string().optional(),
        url: z.string(),
      })
    )
    .optional(),
});

export type CreateTicketInput = z.input<typeof createTicketSchema>;
export type CreateTicketOutput = z.output<typeof createTicketSchema>;

export const updateTicketStatusSchema = z.object({
  ticketId: z.string(),
  status: z.nativeEnum(TicketStatus),
  note: z.string().optional(),
  etaMinutes: z.number().optional().nullable(),
});

export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;

export const rateTicketSchema = z.object({
  ticketId: z.string(),
  rating: z.number().min(1).max(5),
  feedback: z.string().optional(),
  feedbackComment: z.string().optional(),
});

export type RateTicketInput = z.infer<typeof rateTicketSchema>;

export const resolveTicketSchema = z.object({
  ticketId: z.string().min(1, "กรุณาระบุรหัสใบงาน"),
  resolutionNotes: z.string().optional(),
  resolutionDetail: z.string().optional(),
  afterImageUrl: z.string().optional(),
  photoUrl: z.string().optional(),
  completionNote: z.string().optional(),
});

export type ResolveTicketInput = z.infer<typeof resolveTicketSchema>;
