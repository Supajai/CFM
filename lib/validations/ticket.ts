// lib/validations/ticket.ts
import { z } from "zod";
import { Category, Priority, TicketStatus } from "@prisma/client";

export const createTicketSchema = z.object({
  category: z.nativeEnum(Category, {
    errorMap: () => ({ message: "กรุณาเลือกหมวดหมู่ปัญหา" }),
  }),
  building: z.string().min(1, "กรุณาเลือกหรือระบุอาคาร"),
  room: z.string().min(1, "กรุณาระบุห้องหรือจุดเกิดเหตุที่ชัดเจน"),
  specificLocation: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  gpsAccuracy: z.number().optional().nullable(),
  description: z
    .string()
    .min(10, "กรุณากรอกรายละเอียดอาการและปัญหาอย่างน้อย 10 ตัวอักษร"),
  isUrgent: z.boolean().default(false),
  title: z.string().optional(),
  reporterName: z.string().optional(),
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

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

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
});

export type RateTicketInput = z.infer<typeof rateTicketSchema>;
