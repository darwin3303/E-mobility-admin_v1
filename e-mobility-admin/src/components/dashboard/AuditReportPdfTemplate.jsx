import React from 'react';
import {
  FileText,
  Calendar,
  MapPin,
  Route,
  Clock,
  User,
  Sliders,
  Car,
  AlertTriangle,
  Gauge,
  QrCode
} from 'lucide-react';

export default function AuditReportPdfTemplate({
  id = 'audit-report-pdf-root',
  reportId = 'RPT-2025-06-16-0001',
  reportName = 'E01 Speed Audit - 16 Jun 2025',
  highway = 'E01 Southern Expressway',
  dateRange = '2025-06-16 00:00:00 to 2025-06-16 23:59:59',
  generatedOn = '2025-06-16 13:39:56',
  generatedBy = 'R. Senanayake (Operations Lead)',
  totalVehicles = 2487,
  speedViolations = 312,
  warnings = 86,
  averageSpeed = 82,
  records = []
}) {
  const displayRecords = records && records.length > 0 ? records.slice(0, 10) : [
    { id: 1, plate: 'CAK 1234', makeModel: 'Toyota Corolla (White)', dateTime: '2025-06-16 13:28:14', location: 'Galle (Km 112.4)', lane: 'Lane 2', detectedSpeed: 118, speedLimit: 100, difference: 18, status: 'Violation' },
    { id: 2, plate: 'WP KD 7788', makeModel: 'Honda Civic (Black)', dateTime: '2025-06-16 13:24:37', location: 'Homagama (Km 98.7)', lane: 'Lane 1', detectedSpeed: 96, speedLimit: 100, difference: -4, status: 'Normal' },
    { id: 3, plate: 'NC 4567', makeModel: 'Nissan X-Trail (Silver)', dateTime: '2025-06-16 13:21:03', location: 'Kottawa (Km 89.2)', lane: 'Lane 3', detectedSpeed: 142, speedLimit: 100, difference: 42, status: 'Violation' },
    { id: 4, plate: 'CBF 5521', makeModel: 'Suzuki Alto (Blue)', dateTime: '2025-06-16 13:18:49', location: 'Colombo (Km 75.8)', lane: 'Lane 2', detectedSpeed: 88, speedLimit: 100, difference: -12, status: 'Normal' },
    { id: 5, plate: 'WP KX 2288', makeModel: 'Toyota Prius (Gray)', dateTime: '2025-06-16 13:15:22', location: 'Panadura (Km 63.1)', lane: 'Lane 1', detectedSpeed: 105, speedLimit: 100, difference: 5, status: 'Warning' },
    { id: 6, plate: 'SP 9473', makeModel: 'Mitsubishi Lancer (White)', dateTime: '2025-06-16 13:12:07', location: 'Kalutara (Km 54.6)', lane: 'Lane 3', detectedSpeed: 76, speedLimit: 100, difference: -24, status: 'Normal' },
    { id: 7, plate: 'CAK 6622', makeModel: 'Isuzu D-Max (Black)', dateTime: '2025-06-16 13:08:56', location: 'Beruwala (Km 42.3)', lane: 'Lane 2', detectedSpeed: 121, speedLimit: 100, difference: 21, status: 'Violation' },
    { id: 8, plate: 'BKV 3154', makeModel: 'Honda Fit (Red)', dateTime: '2025-06-16 13:05:32', location: 'Bentota (Km 37.9)', lane: 'Lane 1', detectedSpeed: 69, speedLimit: 100, difference: -31, status: 'Normal' },
    { id: 9, plate: 'WP PK 7733', makeModel: 'Land Cruiser (Black)', dateTime: '2025-06-16 13:02:11', location: 'Ahungalla (Km 28.4)', lane: 'Lane 3', detectedSpeed: 110, speedLimit: 100, difference: 10, status: 'Violation' },
    { id: 10, plate: 'KAT 1189', makeModel: 'Tata Nano (Yellow)', dateTime: '2025-06-16 12:58:46', location: 'Induruwa (Km 21.7)', lane: 'Lane 2', detectedSpeed: 82, speedLimit: 100, difference: -18, status: 'Normal' }
  ];

  return (
    <div
      id={id}
      className="bg-white text-slate-800 font-sans px-7 py-5 w-[794px] max-w-[794px] mx-auto border border-slate-300 shadow-md box-border"
      style={{
        width: '794px',
        minHeight: '1080px',
        maxHeight: '1120px',
        boxSizing: 'border-box'
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. HEADER SECTION: LOGO | TITLE | TMC BRANDING */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between pb-2 border-b-2 border-slate-300">
        {/* Left: E-Mobility Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center p-1.5 shadow-xs">
            <svg viewBox="0 0 48 48" className="w-full h-full text-white" fill="none">
              <path d="M8 40 C14 16, 34 16, 40 40" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M15 40 C19 23, 29 23, 33 40" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
              <line x1="24" y1="24" x2="24" y2="40" stroke="#fef08a" strokeWidth="2" strokeDasharray="3 3" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-black text-[#0f2b48] tracking-tight leading-none">
              E-MOBILITY
            </h1>
            <span className="text-[9px] font-bold text-sky-600 uppercase tracking-widest block mt-0.5">
              TMC SRI LANKA
            </span>
          </div>
        </div>

        {/* Center: Main Report Title */}
        <div className="text-center">
          <h2 className="text-lg font-black text-[#0f2b48] uppercase tracking-wide">
            SPEED & VIOLATION AUDIT REPORT
          </h2>
        </div>

        {/* Right: TMC Logo */}
        <div className="text-right">
          <div className="text-xl font-black text-sky-500 tracking-tight leading-none">
            TMC
          </div>
          <span className="text-[8px] text-slate-500 font-medium block mt-0.5">
            Traffic Management Center
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. METADATA SECTION: 2-COLUMN PARAMETERS & FILTERS */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-12 gap-4 py-2 border-b border-slate-200 text-[10px]">
        {/* Left Column (7 of 12 cols): Report Details */}
        <div className="col-span-7 space-y-1 pr-3 border-r border-slate-200">
          <div className="flex items-center">
            <span className="w-32 font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-slate-400" /> Report ID
            </span>
            <span className="text-slate-400 mr-2">:</span>
            <span className="font-mono font-medium text-slate-900">{reportId}</span>
          </div>

          <div className="flex items-center">
            <span className="w-32 font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-slate-400" /> Report Name
            </span>
            <span className="text-slate-400 mr-2">:</span>
            <span className="font-medium text-slate-900">{reportName}</span>
          </div>

          <div className="flex items-center">
            <span className="w-32 font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-slate-400" /> Highway
            </span>
            <span className="text-slate-400 mr-2">:</span>
            <span className="font-medium text-slate-900">{highway}</span>
          </div>

          <div className="flex items-center">
            <span className="w-32 font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-slate-400" /> Date & Time Range
            </span>
            <span className="text-slate-400 mr-2">:</span>
            <span className="font-medium text-slate-900">{dateRange}</span>
          </div>

          <div className="flex items-center">
            <span className="w-32 font-semibold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-400" /> Generated On
            </span>
            <span className="text-slate-400 mr-2">:</span>
            <span className="font-medium text-slate-900">{generatedOn}</span>
          </div>

          <div className="flex items-center">
            <span className="w-32 font-semibold text-slate-700 flex items-center gap-1.5">
              <User className="w-3 h-3 text-slate-400" /> Generated By
            </span>
            <span className="text-slate-400 mr-2">:</span>
            <span className="font-medium text-slate-900">{generatedBy}</span>
          </div>
        </div>

        {/* Right Column (5 of 12 cols): Filters Applied */}
        <div className="col-span-5 space-y-1 pl-1">
          <div className="text-[10px] font-bold text-sky-800 uppercase tracking-wider mb-0.5">
            Filters Applied
          </div>

          <div className="flex items-center">
            <span className="w-24 font-semibold text-slate-700 flex items-center gap-1.5">
              <Route className="w-3 h-3 text-slate-400" /> Lane
            </span>
            <span className="text-slate-400 mr-2">:</span>
            <span className="font-medium text-slate-900">All Lanes</span>
          </div>

          <div className="flex items-center">
            <span className="w-24 font-semibold text-slate-700 flex items-center gap-1.5">
              <Car className="w-3 h-3 text-slate-400" /> Status
            </span>
            <span className="text-slate-400 mr-2">:</span>
            <span className="font-medium text-slate-900">All (Normal + Violation)</span>
          </div>

          <div className="flex items-center">
            <span className="w-24 font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-slate-400" /> Plate Number
            </span>
            <span className="text-slate-400 mr-2">:</span>
            <span className="font-medium text-slate-900">All</span>
          </div>

          <div className="flex items-center">
            <span className="w-24 font-semibold text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-3 h-3 text-slate-400" /> Other Filters
            </span>
            <span className="text-slate-400 mr-2">:</span>
            <span className="font-medium text-slate-900">None</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. SUMMARY KPI METRIC CARDS */}
      {/* ------------------------------------------------------------- */}
      <div className="pt-2 pb-1">
        <h3 className="text-[11px] font-black text-[#0f2b48] uppercase tracking-wider mb-1.5">
          SUMMARY
        </h3>

        <div className="grid grid-cols-4 gap-2.5">
          {/* Card 1: Total Vehicles */}
          <div className="p-2 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">
                TOTAL VEHICLES
              </span>
              <span className="text-base font-black text-slate-900 leading-tight block">
                {totalVehicles.toLocaleString()}
              </span>
              <span className="text-[8px] font-semibold text-emerald-600 block">
                ↑ 12% vs. previous period
              </span>
            </div>
          </div>

          {/* Card 2: Speed Violations */}
          <div className="p-2 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-black text-sm flex-shrink-0">
              !
            </div>
            <div>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">
                SPEED VIOLATIONS
              </span>
              <span className="text-base font-black text-slate-900 leading-tight block">
                {speedViolations.toLocaleString()}
              </span>
              <span className="text-[8px] font-semibold text-rose-500 block">
                12.6% of total vehicles
              </span>
            </div>
          </div>

          {/* Card 3: Warnings */}
          <div className="p-2 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">
                WARNINGS
              </span>
              <span className="text-base font-black text-slate-900 leading-tight block">
                {warnings.toLocaleString()}
              </span>
              <span className="text-[8px] font-semibold text-amber-600 block">
                3.5% of total vehicles
              </span>
            </div>
          </div>

          {/* Card 4: Average Speed */}
          <div className="p-2 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center flex-shrink-0">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block">
                AVERAGE SPEED
              </span>
              <span className="text-base font-black text-slate-900 leading-tight block">
                {averageSpeed} km/h
              </span>
              <span className="text-[8px] font-semibold text-emerald-600 block">
                ↓ 6% vs. previous period
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. CHARTS SECTION: DONUT DISTRIBUTION & BAR DISTRIBUTION */}
      {/* ------------------------------------------------------------- */}
      <div className="my-2 p-2 rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="grid grid-cols-2 gap-3 items-center">
          {/* Left Chart: VEHICLE STATUS DISTRIBUTION */}
          <div>
            <h4 className="text-[10px] font-bold text-center text-[#0f2b48] uppercase tracking-wider mb-1">
              VEHICLE STATUS DISTRIBUTION
            </h4>
            <div className="flex items-center justify-center gap-3">
              {/* SVG Donut Chart */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Background track */}
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f1f5f9" strokeWidth="15" />
                  {/* Normal Segment (83.9% = ~200 perimeter) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#22c55e"
                    strokeWidth="15"
                    strokeDasharray="200.3 238.7"
                    strokeDashoffset="0"
                  />
                  {/* Warnings Segment (3.5% = ~8.4 perimeter) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#f97316"
                    strokeWidth="15"
                    strokeDasharray="8.4 238.7"
                    strokeDashoffset="-200.3"
                  />
                  {/* Violations Segment (12.5% = ~29.8 perimeter) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#ef4444"
                    strokeWidth="15"
                    strokeDasharray="29.8 238.7"
                    strokeDashoffset="-208.7"
                  />
                </svg>
                {/* Center Percentage Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-black text-slate-800">83.9%</span>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="space-y-1 text-[9px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-xs bg-[#ef4444] inline-block"></span>
                  <span className="font-semibold text-slate-700">Violations (312)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-xs bg-[#f97316] inline-block"></span>
                  <span className="font-semibold text-slate-700">Warnings (86)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-xs bg-[#22c55e] inline-block"></span>
                  <span className="font-semibold text-slate-700">Normal (2,089)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Chart: SPEED RANGE DISTRIBUTION */}
          <div>
            <h4 className="text-[10px] font-bold text-center text-[#0f2b48] uppercase tracking-wider mb-0.5">
              SPEED RANGE DISTRIBUTION
            </h4>
            {/* SVG Bar Chart with Values */}
            <div className="flex items-end justify-between h-20 px-2 pt-3 pb-1 border-b border-l border-slate-300 relative text-[8px]">
              {/* Y-axis labels */}
              <div className="absolute -left-6 top-0 text-[7px] text-slate-400">1,200</div>
              <div className="absolute -left-5 top-1/2 -translate-y-1/2 text-[7px] text-slate-400">600</div>
              <div className="absolute -left-3 bottom-0.5 text-[7px] text-slate-400">0</div>

              {/* Bar 1: 0 - 60 (312) */}
              <div className="flex flex-col items-center gap-0.5 w-8">
                <span className="font-bold text-slate-700 text-[8px]">312</span>
                <div className="w-full bg-[#7ecbf2] rounded-t-xs" style={{ height: '18px' }}></div>
                <span className="text-[7.5px] text-slate-600 font-medium">0-60</span>
              </div>

              {/* Bar 2: 61 - 80 (842) */}
              <div className="flex flex-col items-center gap-0.5 w-8">
                <span className="font-bold text-slate-700 text-[8px]">842</span>
                <div className="w-full bg-[#7ecbf2] rounded-t-xs" style={{ height: '48px' }}></div>
                <span className="text-[7.5px] text-slate-600 font-medium">61-80</span>
              </div>

              {/* Bar 3: 81 - 100 (908) */}
              <div className="flex flex-col items-center gap-0.5 w-8">
                <span className="font-bold text-slate-700 text-[8px]">908</span>
                <div className="w-full bg-[#7ecbf2] rounded-t-xs" style={{ height: '54px' }}></div>
                <span className="text-[7.5px] text-slate-600 font-medium">81-100</span>
              </div>

              {/* Bar 4: 101 - 120 (325) */}
              <div className="flex flex-col items-center gap-0.5 w-8">
                <span className="font-bold text-slate-700 text-[8px]">325</span>
                <div className="w-full bg-[#7ecbf2] rounded-t-xs" style={{ height: '20px' }}></div>
                <span className="text-[7.5px] text-slate-600 font-medium">101-120</span>
              </div>

              {/* Bar 5: 121+ (100) */}
              <div className="flex flex-col items-center gap-0.5 w-8">
                <span className="font-bold text-slate-700 text-[8px]">100</span>
                <div className="w-full bg-[#7ecbf2] rounded-t-xs" style={{ height: '8px' }}></div>
                <span className="text-[7.5px] text-slate-600 font-medium">121+</span>
              </div>
            </div>
            <div className="text-center text-[7.5px] font-semibold text-slate-500 mt-0.5">
              Speed Range (km/h)
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. TABLE: DETECTED VEHICLE RECORDS (Top 10) */}
      {/* ------------------------------------------------------------- */}
      <div className="mt-2">
        <h3 className="text-[11px] font-black text-[#0f2b48] uppercase tracking-wider mb-1">
          DETECTED VEHICLE RECORDS (Top 10)
        </h3>

        <div className="overflow-hidden border border-slate-200 rounded-md">
          <table className="w-full text-left border-collapse text-[8.5px]">
            <thead>
              <tr className="bg-[#0f2b48] text-white font-bold">
                <th className="py-1 px-1.5 text-center w-7">#</th>
                <th className="py-1 px-2">Vehicle / Plate</th>
                <th className="py-1 px-1.5 text-center">Date & Time</th>
                <th className="py-1 px-1.5 text-center">Location</th>
                <th className="py-1 px-1.5 text-center">Lane</th>
                <th className="py-1 px-1.5 text-center">Detected Speed (km/h)</th>
                <th className="py-1 px-1.5 text-center">Speed Limit (km/h)</th>
                <th className="py-1 px-1.5 text-center">Difference (km/h)</th>
                <th className="py-1 px-1.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {displayRecords.map((item, idx) => {
                const isViolation = item.status === 'Violation';
                const isWarning = item.status === 'Warning';
                return (
                  <tr key={item.id || idx} className="hover:bg-slate-50">
                    <td className="py-1 px-1.5 text-center font-semibold text-slate-500">{item.id || idx + 1}</td>
                    <td className="py-1 px-2">
                      <div className="font-bold text-slate-900 leading-none">{item.plate}</div>
                      <div className="text-[7.5px] text-slate-500 mt-0.5">{item.makeModel}</div>
                    </td>
                    <td className="py-1 px-1.5 text-center font-mono text-[8px] text-slate-700">{item.dateTime}</td>
                    <td className="py-1 px-1.5 text-center text-slate-700">{item.location}</td>
                    <td className="py-1 px-1.5 text-center font-medium text-slate-700">{item.lane}</td>
                    <td className="py-1 px-1.5 text-center font-bold text-slate-900">{item.detectedSpeed}</td>
                    <td className="py-1 px-1.5 text-center text-slate-600">{item.speedLimit}</td>
                    <td className={`py-1 px-1.5 text-center font-bold font-mono ${
                      item.difference > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {item.difference > 0 ? `+${item.difference}` : item.difference}
                    </td>
                    <td className="py-1 px-1.5 text-center">
                      {isViolation && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 font-bold text-[8px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span> Violation
                        </span>
                      )}
                      {isWarning && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 font-bold text-[8px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Warning
                        </span>
                      )}
                      {!isViolation && !isWarning && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold text-[8px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Normal
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="text-[8.5px] text-slate-500 mt-0.5 pl-0.5">
          Showing 1 – 10 of {totalVehicles.toLocaleString()} vehicles
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6. FOOTER: QR CODE & SIGNATURE */}
      {/* ------------------------------------------------------------- */}
      <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-end justify-between text-xs">
        {/* Left: QR Code & Notes */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 p-0.5 bg-white border border-slate-300 rounded flex items-center justify-center flex-shrink-0">
            <QrCode className="w-8 h-8 text-slate-800" />
          </div>
          <div className="text-[8px] text-slate-500 leading-tight max-w-xs">
            <strong className="text-slate-700 block">Notes:</strong>
            This report is system generated and does not require a signature.
            <br />
            For any queries, please contact the Traffic Management Center.
          </div>
        </div>

        {/* Right: Signature */}
        <div className="text-right">
          <div className="w-40 border-t border-slate-700 ml-auto mb-0.5"></div>
          <div className="font-bold text-[10px] text-slate-900 leading-tight">
            R. Senanayake
          </div>
          <div className="text-[8.5px] text-slate-600">
            Operations Lead
          </div>
          <div className="text-[7.5px] text-slate-500">
            Traffic Management Center
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 7. BOTTOM DOCUMENT STRIP: ORGANIZATION & PAGE NUMBER */}
      {/* ------------------------------------------------------------- */}
      <div className="mt-2 pt-1 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-400">
        <span>E-Mobility TMC Sri Lanka</span>
        <span>Page 1 of 8</span>
      </div>
    </div>
  );
}
