// components/ticket/TicketMilestoneStepper.tsx
"use client";

import React from "react";
import { Check, Wrench, Clock, UserCheck } from "lucide-react";

export interface TicketMilestoneStepperProps {
  status: string; // PENDING, ASSIGNED, IN_PROGRESS, ON_HOLD, RESOLVED, CLOSED
  isOnHold?: boolean;
  className?: string;
}

export default function TicketMilestoneStepper({
  status,
  isOnHold = false,
  className = "",
}: TicketMilestoneStepperProps) {
  const isResolvedOrClosed = status === "RESOLVED" || status === "CLOSED";
  const isInProgress = status === "IN_PROGRESS";
  const isHold = isOnHold || status === "ON_HOLD";
  const isAssigned = status === "ASSIGNED";

  // กำหนด 4 ขั้นตอน
  const steps = [
    {
      id: 1,
      label: "1. แจ้งซ่อม",
      status: "completed" as const,
    },
    {
      id: 2,
      label: "2. มอบหมายช่าง",
      status: (
        isResolvedOrClosed || isInProgress || isHold || isAssigned
          ? "completed"
          : "current"
      ) as "completed" | "current" | "upcoming",
    },
    {
      id: 3,
      label: isHold ? "3. พักงาน / ยกกลับศูนย์" : "3. ดำเนินการซ่อม",
      status: (
        isResolvedOrClosed
          ? "completed"
          : isInProgress || isHold || isAssigned
          ? "current"
          : "upcoming"
      ) as "completed" | "current" | "upcoming",
    },
    {
      id: 4,
      label: "4. ปิดงานสำเร็จ",
      status: (
        isResolvedOrClosed
          ? "completed"
          : "upcoming"
      ) as "completed" | "current" | "upcoming",
    },
  ];

  // คำนวณความกว้างของเส้นเชื่อมต่อสีเขียว (Progress Bar Width)
  let progressWidth = "0%";
  if (isResolvedOrClosed) {
    progressWidth = "100%";
  } else if (isInProgress || isHold || isAssigned) {
    progressWidth = "66.66%"; // เชื่อมถึงจุดที่ 3 (ดำเนินการซ่อม)
  } else {
    progressWidth = "33.33%"; // เชื่อมถึงจุดที่ 2 (มอบหมายช่าง)
  }

  return (
    <div className={`w-full bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-sm ${className}`}>
      <div className="relative flex items-start justify-between">
        {/* เส้นเชื่อมต่อพื้นหลังสีเทา (Upcoming Track Line) */}
        <div className="absolute left-[12.5%] right-[12.5%] top-5 sm:top-[22px] -translate-y-1/2 h-[3px] bg-slate-200 z-0">
          {/* เส้นเชื่อมต่อที่ผ่านแล้วสีเขียว (Completed Track Line) */}
          <div
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: progressWidth }}
          />
        </div>

        {steps.map((step) => {
          const isCompleted = step.status === "completed";
          const isCurrent = step.status === "current";

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center flex-1 min-w-0 px-1">
              {/* จุดวงกลมแสดงสถานะ (Step Node Circle) */}
              <div className="relative flex items-center justify-center">
                {/* เอฟเฟกต์กระพริบเรดาร์ (Radar Ping Beacon) สำหรับขั้นตอนปัจจุบัน */}
                {isCurrent && (
                  <span
                    className={`absolute -inset-1 sm:-inset-1.5 rounded-full ${
                      isHold ? "bg-amber-400" : "bg-blue-400"
                    } opacity-75 animate-ping pointer-events-none`}
                  />
                )}

                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                      : isCurrent
                      ? isHold
                        ? "bg-amber-500 text-white ring-4 ring-amber-100 shadow-md shadow-amber-200 font-bold"
                        : "bg-blue-600 text-white ring-4 ring-blue-100 shadow-md shadow-blue-200 font-bold"
                      : "bg-slate-50 text-slate-400 border-2 border-slate-200"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white stroke-[2.5]" />
                  ) : isCurrent ? (
                    step.id === 3 ? (
                      isHold ? (
                        <Clock className="w-5 h-5 text-white animate-pulse" />
                      ) : (
                        <Wrench className="w-5 h-5 text-white" />
                      )
                    ) : step.id === 2 ? (
                      <UserCheck className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-sm font-bold text-white">{step.id}</span>
                    )
                  ) : (
                    <span className="text-xs sm:text-sm font-semibold text-slate-400">{step.id}</span>
                  )}
                </div>
              </div>

              {/* ข้อความกำกับใต้จุด (Label below Node) */}
              <div className="mt-2.5 sm:mt-3 flex flex-col items-center text-center w-full">
                {isCurrent ? (
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                          isHold ? "bg-amber-400" : "bg-blue-400"
                        } opacity-75`}
                      />
                      <span
                        className={`relative inline-flex rounded-full h-2 w-2 ${
                          isHold ? "bg-amber-500" : "bg-blue-600"
                        }`}
                      />
                    </span>
                    <span
                      className={`text-[11px] sm:text-xs md:text-sm font-bold leading-tight ${
                        isHold ? "text-amber-800" : "text-blue-700"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ) : isCompleted ? (
                  <span className="text-[11px] sm:text-xs md:text-sm font-semibold text-slate-700 leading-tight">
                    {step.label}
                  </span>
                ) : (
                  <span className="text-[11px] sm:text-xs md:text-sm font-medium text-slate-400 leading-tight">
                    {step.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

