// components/building/FloorPlanViewContainer.tsx
"use client";

import React, { useState } from "react";
import BuildingFloorMap, {
  BuildingFloorMapProps,
  TicketSummary,
  TechnicianOption,
  RoomHeatmapStat,
} from "./BuildingFloorMap";
import RoomAssetInspector, { AssetInfo } from "./RoomAssetInspector";
import { BuildingRoomPlan } from "@/lib/constants/building-plan";

export default function FloorPlanViewContainer(props: BuildingFloorMapProps) {
  // 3. การสลับหน้าจอ (Switching Views) จัดการผ่าน State selectedRoomForInspection
  const [selectedRoomForInspection, setSelectedRoomForInspection] = useState<BuildingRoomPlan | null>(null);

  const handleInspectRoom = (room: BuildingRoomPlan) => {
    setSelectedRoomForInspection(room);
  };

  const handleBackToFloorMap = () => {
    setSelectedRoomForInspection(null);
  };

  const handleSelectAsset = (asset: AssetInfo) => {
    // Handler for asset selection in drill-down view
    if (props.onSelectRoom && selectedRoomForInspection) {
      props.onSelectRoom(selectedRoomForInspection);
    }
  };

  if (selectedRoomForInspection) {
    return (
      <RoomAssetInspector
        roomId={selectedRoomForInspection.code || selectedRoomForInspection.id}
        roomName={selectedRoomForInspection.name}
        floor={selectedRoomForInspection.floor}
        currentUserRole={props.currentUserRole}
        onBack={handleBackToFloorMap}
        onSelectAsset={handleSelectAsset}
      />
    );
  }

  return (
    <BuildingFloorMap
      {...props}
      onInspectRoom={handleInspectRoom}
    />
  );
}

export type { TicketSummary, TechnicianOption, RoomHeatmapStat, BuildingFloorMapProps };

