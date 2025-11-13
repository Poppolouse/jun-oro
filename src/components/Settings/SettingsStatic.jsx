import React from "react";
import { Card } from "../ui";
import {
  AuditLogsSection,
  TrafficLogsSection,
  ApiKeysSection,
  ChangelogSection,
  R2StorageSection,
} from ".";

/**
 * SettingsStatic — assembles static skeleton sections for preview.
 * No data wiring; used to visualize page layout.
 */
export default function SettingsStatic() {
  return (
    <div className="p-6 space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Ayarlar — Statik Önizleme</h1>
        <p className="text-[#6B6661] mt-1">Bu görünüm işlevsellik olmadan sadece layout’u gösterir.</p>
      </Card>
      <div className="grid grid-cols-1 gap-6">
        <AuditLogsSection />
        <TrafficLogsSection />
        <ApiKeysSection />
        <ChangelogSection />
        <R2StorageSection />
      </div>
    </div>
  );
}

