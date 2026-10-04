import React from 'react';
import CorridorKpiRibbon from './CorridorKpiRibbon';
import VideoWall from './VideoWall';
import LiveAnprStream from './LiveAnprStream';
import IncidentQueuePanel from './IncidentQueuePanel';
import VmsGantryBar from './VmsGantryBar';
import { AI_SERVER_URL } from '../../config/env';

export default function OverviewView({
  telemetry,
  cameras,
  violations,
  incidents,
  isDarkMode = true,
  onInspectCamera,
  onCalibrateCamera,
  onSelectViolation,
  onDispatchPatrol,
  onAcknowledgeIncident,
  aiServerUrl = AI_SERVER_URL
}) {
  return (
    <div className="space-y-4">
      {/* 1. High-Density Corridor KPI Telemetry Ribbon */}
      <CorridorKpiRibbon
        telemetry={telemetry}
        totalRegistryCount={7000}
        violationsCount={violations.length}
        activeHazardsCount={incidents.length}
        isDarkMode={isDarkMode}
      />

      {/* 2. Main Stage: Tactical CCTV Video Wall (Left/Center 8 Cols) & Tactical Feeds (Right 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* CCTV Video Wall Matrix (8 of 12 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <VideoWall
            cameras={cameras}
            isDarkMode={isDarkMode}
            onInspectCamera={onInspectCamera}
            onCalibrateCamera={onCalibrateCamera}
            aiServerUrl={aiServerUrl}
          />

          {/* Overhead Variable Message Signs (VMS) Control Bar */}
          <VmsGantryBar
            sector="E01 Southern Expressway (KM 14.2 - KM 68.4)"
            isDarkMode={isDarkMode}
            onUpdateMessage={(msg) => console.log('Broadcasting VMS:', msg)}
          />
        </div>

        {/* Right Side: Emergency Hazard Queue + Live ANPR Radar Stream (4 of 12 Cols) */}
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          {/* Active Incident Triage Queue */}
          <div className="flex-1">
            <IncidentQueuePanel
              incidents={incidents}
              isDarkMode={isDarkMode}
              onInspectCamera={onInspectCamera}
              onDispatchPatrol={onDispatchPatrol}
              onAcknowledge={onAcknowledgeIncident}
            />
          </div>

          {/* Live ANPR License Plate Radar Feed */}
          <div className="flex-1">
            <LiveAnprStream
              violations={violations}
              isDarkMode={isDarkMode}
              onSelectViolation={onSelectViolation}
              maxItems={6}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
