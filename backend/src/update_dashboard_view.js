import fs from 'fs';

const filePath = 'd:/e-mobility-vehicle-portal/src/components/DashboardView.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Ensure selectedVehiclePlate state exists
if (!content.includes('const [selectedVehiclePlate, setSelectedVehiclePlate]')) {
  content = content.replace(
    `const [expandedTicketId, setExpandedTicketId] = useState(null);`,
    `const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState('WP CAB-4521');`
  );
}

// 2. Compute dynamic display vehicles and activeEvidenceFine
const vehicleComputationSnippet = `
  // Dynamic display vehicles linked to user
  const displayVehicles = React.useMemo(() => {
    if (vehicles && vehicles.length > 0) {
      return vehicles.map((v, idx) => {
        const plateNorm = (v.plate || '').replace(/[^A-Z0-9]/g, '');
        const matchingFine = (fines || []).find(f => 
          f.status !== 'Paid' && 
          (f.vehiclePlate || '').replace(/[^A-Z0-9]/g, '') === plateNorm
        );
        return {
          id: v.id || \`v_\${idx}\`,
          model: \`\${v.make || ''} \${v.model || ''} • \${v.year || ''}\`.trim() || 'Toyota Aqua Hybrid',
          plate: v.plate || 'WP CAB-4521',
          type: v.type || 'Hybrid EV',
          status: matchingFine ? 'Pending Fine' : 'Clear',
          statusType: matchingFine ? 'warning' : 'success',
          batteryLevel: v.batteryLevel || v.battery_level || 90,
          revenueLicenseStatus: v.revenueLicenseStatus || v.revenue_license_status || 'Valid'
        };
      });
    }
    return [
      {
        id: 'g_01',
        model: 'Toyota Aqua • 2020',
        plate: 'WP CAB-4521',
        type: 'Hybrid 1.5L Synergy',
        status: (fines || []).some(f => f.status !== 'Paid' && (f.vehiclePlate || '').includes('CAB-4521')) ? 'Pending Fine' : 'Clear',
        statusType: (fines || []).some(f => f.status !== 'Paid' && (f.vehiclePlate || '').includes('CAB-4521')) ? 'warning' : 'success'
      },
      {
        id: 'g_02',
        model: 'Suzuki Wagon R • 2021',
        plate: 'SP KY-3390',
        type: 'Mild Hybrid 660cc',
        status: (fines || []).some(f => f.status !== 'Paid' && (f.vehiclePlate || '').includes('KY-3390')) ? 'Pending Fine' : 'Clear',
        statusType: (fines || []).some(f => f.status !== 'Paid' && (f.vehiclePlate || '').includes('KY-3390')) ? 'warning' : 'success'
      }
    ];
  }, [vehicles, fines]);

  // Dynamically resolve the high-speed ticket evidence for the active vehicle
  const activeEvidenceFine = React.useMemo(() => {
    if (!fines || fines.length === 0) return null;
    const cleanSelected = (selectedVehiclePlate || 'WP CAB-4521').replace(/[^A-Z0-9]/g, '');

    // 1. Try unpaid fine matching selected vehicle
    const unpaidMatch = fines.find(f => 
      f.status !== 'Paid' && 
      (f.vehiclePlate || '').replace(/[^A-Z0-9]/g, '').includes(cleanSelected)
    );
    if (unpaidMatch) return unpaidMatch;

    // 2. Try any fine matching selected vehicle
    const anyMatch = fines.find(f => 
      (f.vehiclePlate || '').replace(/[^A-Z0-9]/g, '').includes(cleanSelected)
    );
    if (anyMatch) return anyMatch;

    // 3. Fallback to first unpaid fine in database or first fine
    return fines.find(f => f.status !== 'Paid') || fines[0];
  }, [fines, selectedVehiclePlate]);
`;

// Replace defaultVehicles definition with dynamic computation
content = content.replace(
  /const defaultVehicles = \[[\s\S]*?\];\s*return \(/,
  `${vehicleComputationSnippet}\n  return (`
);

// In Home View, update My Garage vehicle cards mapping and active styling
content = content.replace(
  /{defaultVehicles\.map\(\(v\)\s*=>\s*\([\s\S]*?<\/div>\s*\)\)\}/,
  `{displayVehicles.map((v) => {
                const isSelected = (selectedVehiclePlate || '').replace(/[^A-Z0-9]/g, '') === (v.plate || '').replace(/[^A-Z0-9]/g, '');
                return (
                  <div
                    key={v.id}
                    className="vehicle-card-pro"
                    onClick={() => setSelectedVehiclePlate(v.plate)}
                    style={{
                      cursor: 'pointer',
                      border: isSelected ? '1.5px solid rgba(59, 130, 246, 0.6)' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isSelected ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.3) 0%, rgba(15, 23, 42, 0.8) 100%)' : undefined,
                      boxShadow: isSelected ? '0 8px 24px rgba(59, 130, 246, 0.2)' : undefined,
                      transition: 'all 0.25s ease'
                    }}
                  >
                    <div className="vehicle-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                        <div className="vehicle-icon-bubble" style={{ background: isSelected ? 'rgba(59, 130, 246, 0.3)' : undefined }}>
                          <Car size={22} color={isSelected ? '#60a5fa' : undefined} />
                        </div>
                        <div className="vehicle-main-info">
                          <div className="vehicle-model-text">
                            {v.model}
                          </div>
                          <div className="vehicle-meta-sub">
                            <SriLankaPlate plate={v.plate} compact={true} />
                            <span style={{ fontSize: '10.5px', color: '#64748b' }}>•</span>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                              {v.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className={v.statusType === 'warning' ? 'status-pill-warning' : 'status-pill-success'}>
                        <span className="live-dot-pulse" />
                        {v.status}
                      </span>
                    </div>
                  </div>
                );
              })}`
);

// Update Ticket Evidence Card in Home view
const newTicketEvidenceSection = `            {/* Ticket Evidence Section */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '17px', fontWeight: '800', color: '#ffffff' }}>
                  {t('ticketEvidence')}
                </h2>
                {activeEvidenceFine && (
                  <span style={{ fontSize: '11.5px', color: '#94a3b8', fontWeight: '600' }}>
                    Linked Vehicle: <strong style={{ color: '#93c5fd' }}>{activeEvidenceFine.vehiclePlate}</strong>
                  </span>
                )}
              </div>

              {activeEvidenceFine ? (
                <div className="radar-evidence-card">
                  <div className="radar-header-row">
                    <div className="citation-ref-badge">
                      <span style={{ color: '#64748b' }}>CITATION:</span>
                      <span style={{ color: '#ffffff' }}>#{activeEvidenceFine.id}</span>
                    </div>
                    <span className={activeEvidenceFine.status === 'Paid' ? 'citation-paid-pill' : activeEvidenceFine.status === 'Disputed' ? 'citation-disputed-pill' : 'citation-unpaid-pill'} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '800',
                      background: activeEvidenceFine.status === 'Paid' ? 'rgba(16, 185, 129, 0.15)' : activeEvidenceFine.status === 'Disputed' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: activeEvidenceFine.status === 'Paid' ? '#34d399' : activeEvidenceFine.status === 'Disputed' ? '#fbbf24' : '#fca5a5',
                      border: \`1px solid \${activeEvidenceFine.status === 'Paid' ? 'rgba(16, 185, 129, 0.3)' : activeEvidenceFine.status === 'Disputed' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}\`
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeEvidenceFine.status === 'Paid' ? '#34d399' : activeEvidenceFine.status === 'Disputed' ? '#fbbf24' : '#f43f5e', display: 'inline-block' }} />
                      {activeEvidenceFine.status === 'Paid' ? 'Paid Citation' : activeEvidenceFine.status === 'Disputed' ? 'Under Dispute' : 'Unpaid Citation'}
                    </span>
                  </div>

                  {/* High-tech ANPR CCTV Camera Frame */}
                  <div className="cctv-frame-pro">
                    <img
                      src={activeEvidenceFine.evidenceImage || "/speed_cam_vehicle.png"}
                      alt="High-Speed Evidence Capture"
                      className="cctv-bg-img"
                    />

                    <div className="cctv-vignette-overlay" />
                    <div className="cctv-scanline-laser" />

                    {/* Top Camera Metadata HUD */}
                    <div className="cctv-rec-pill">
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', boxShadow: '0 0 8px #ef4444' }} />
                      <span>{activeEvidenceFine.status === 'Paid' ? 'CAM ARCHIVE' : 'REC LIVE'}</span>
                    </div>

                    <div className="cctv-cam-id-pill">
                      {activeEvidenceFine.camera || 'CAM-07 • SOUTHERN EXPY KM 68.4'}
                    </div>

                    {/* AI Optical ANPR Target Reticle locking on License Plate */}
                    <div className="anpr-target-reticle">
                      <div className="anpr-bracket-tl" />
                      <div className="anpr-bracket-tr" />
                      <div className="anpr-bracket-bl" />
                      <div className="anpr-bracket-br" />

                      <div className="anpr-license-tag">
                        {activeEvidenceFine.vehiclePlate}
                      </div>

                      <SriLankaPlate plate={activeEvidenceFine.vehiclePlate} compact={true} />

                      <div className="anpr-match-score">
                        ANPR MATCH: {activeEvidenceFine.anprMatch || '99.8%'}
                      </div>
                    </div>
                  </div>

                  {/* Speed Radar Telemetry & Radial SVG Gauge */}
                  <div className="speed-telemetry-container">
                    <div className="speedometer-visual-box">
                      <svg className="gauge-svg-circle" viewBox="0 0 82 82">
                        <circle className="gauge-track-bg" cx="41" cy="41" r="36" />
                        <circle
                          className="gauge-track-fill"
                          cx="41"
                          cy="41"
                          r="36"
                          stroke={activeEvidenceFine.status === 'Paid' ? '#10b981' : '#f43f5e'}
                          strokeDasharray="226.195"
                          strokeDashoffset={Math.max(0, 226.195 - ((activeEvidenceFine.capturedSpeed || 128) / 160) * 226.195)}
                        />
                      </svg>
                      <div className="gauge-inner-content">
                        <span className="gauge-speed-val" style={{ color: activeEvidenceFine.status === 'Paid' ? '#34d399' : '#ffffff' }}>
                          {activeEvidenceFine.capturedSpeed || 128}
                        </span>
                        <span className="gauge-speed-unit">KM/H</span>
                      </div>
                    </div>

                    <div className="telemetry-data-col">
                      <div className="telemetry-row-item">
                        <span className="telemetry-row-label">Captured Speed</span>
                        <span className="telemetry-row-val" style={{ color: '#f43f5e' }}>
                          {activeEvidenceFine.speedRecorded || \`\${activeEvidenceFine.capturedSpeed || 128} km/h\`}
                        </span>
                      </div>
                      <div className="telemetry-row-item">
                        <span className="telemetry-row-label">Posted Limit</span>
                        <span className="telemetry-row-val" style={{ color: '#e2e8f0' }}>
                          {activeEvidenceFine.speedLimit || \`\${activeEvidenceFine.postedLimit || 100} km/h\`}
                        </span>
                      </div>
                      <div className="telemetry-row-item">
                        <span className="telemetry-row-label">Excess Speed</span>
                        <span className="telemetry-row-val" style={{ color: '#fbbf24' }}>
                          {activeEvidenceFine.excessSpeed || \`+\${(activeEvidenceFine.capturedSpeed || 128) - (activeEvidenceFine.postedLimit || 100)} km/h\`}
                        </span>
                      </div>
                      <div className="telemetry-row-item">
                        <span className="telemetry-row-label">Radar Calibration</span>
                        <span className="telemetry-row-val" style={{ color: '#38bdf8', fontSize: '11px' }}>
                          {activeEvidenceFine.radarCalibration || 'Doppler 77GHz'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location & Time Sub-HUD */}
                  <div style={{
                    marginTop: '12px',
                    padding: '10px 12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: '11.5px',
                    color: '#94a3b8'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                      <MapPin size={13} color="#60a5fa" />
                      <span>{activeEvidenceFine.locationCoords || '6.0329° N, 80.2168° E (Km 68.4 Southern Expressway)'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748b' }}>
                      <span>Division: <strong style={{ color: '#94a3b8' }}>{activeEvidenceFine.policeStation}</strong></span>
                      <span>Date: <strong style={{ color: '#94a3b8' }}>{activeEvidenceFine.dateTime || activeEvidenceFine.date}</strong></span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {activeEvidenceFine.status === 'Unpaid' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', marginTop: '16px' }}>
                      <button
                        className="btn-primary"
                        style={{ height: '46px', fontSize: '13px' }}
                        onClick={() => setSelectedFineForPay(activeEvidenceFine)}
                      >
                        <CreditCard size={16} /> Pay Fine (Rs. {activeEvidenceFine.amount?.toLocaleString()})
                      </button>

                      <button
                        className="btn-alt"
                        style={{ height: '46px', fontSize: '13px', border: '1px solid rgba(244, 63, 94, 0.35)', color: '#fda4af', background: 'rgba(244, 63, 94, 0.1)' }}
                        onClick={() => setSelectedFineForDispute(activeEvidenceFine)}
                      >
                        <ShieldAlert size={16} /> Dispute Ticket
                      </button>
                    </div>
                  )}

                  {activeEvidenceFine.status === 'Paid' && (
                    <div style={{ marginTop: '14px' }}>
                      <button
                        className="btn-alt"
                        style={{ width: '100%', height: '44px', fontSize: '13px', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        onClick={() => alert(\`Official Sri Lanka Police Fine Receipt (PDF)\\nCitation: #\${activeEvidenceFine.id}\\nReceipt No: \${activeEvidenceFine.receiptNo || 'RCP-982314'}\\nVehicle: \${activeEvidenceFine.vehiclePlate}\\nAmount Settled: Rs. \${activeEvidenceFine.amount?.toLocaleString()}\\nStatus: Verified Paid\`)}
                      >
                        <Download size={16} /> Download Official Receipt ({activeEvidenceFine.receiptNo || 'RCP-982314'})
                      </button>
                    </div>
                  )}

                  {activeEvidenceFine.status === 'Disputed' && (
                    <div style={{
                      marginTop: '14px',
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#fbbf24',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: '700'
                    }}>
                      <Clock size={16} /> Case Under Review with Traffic Appeals Branch
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  padding: '24px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  textAlign: 'center'
                }}>
                  <ShieldCheck size={36} color="#34d399" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>Safe Driving Record</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    No recorded high-speed violations for this vehicle.
                  </div>
                </div>
              )}
            </div>`;

content = content.replace(
  /{\/\* Ticket Evidence Section \*\/}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/>\s*\)/,
  `${newTicketEvidenceSection}\n          </>\n        )`
);

// Update Modal onClose callbacks to refresh data
content = content.replace(
  `{selectedFineForPay && (
        <PaymentModal
          fine={selectedFineForPay}
          fines={fines}
          onClose={() => setSelectedFineForPay(null)}
        />
      )}`,
  `{selectedFineForPay && (
        <PaymentModal
          fine={selectedFineForPay}
          fines={fines}
          onClose={() => {
            setSelectedFineForPay(null);
            fetchData();
          }}
        />
      )}`
);

content = content.replace(
  `{selectedFineForDispute && (
        <DisputeModal
          fine={selectedFineForDispute}
          onClose={() => setSelectedFineForDispute(null)}
        />
      )}`,
  `{selectedFineForDispute && (
        <DisputeModal
          fine={selectedFineForDispute}
          onClose={() => {
            setSelectedFineForDispute(null);
            fetchData();
          }}
        />
      )}`
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ DashboardView.jsx updated successfully!');
