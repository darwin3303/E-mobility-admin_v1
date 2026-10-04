import React, { useState, useMemo, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import AuditReportPdfTemplate from './AuditReportPdfTemplate';
import {
  FileText,
  Save,
  Download,
  Car,
  AlertCircle,
  AlertTriangle,
  Gauge,
  Calendar,
  MapPin,
  Route,
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  Eye,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  X,
  Printer,
  QrCode,
  Building2,
  ExternalLink
} from 'lucide-react';

// Baseline 10 high-fidelity audit records directly from user template design
const INITIAL_AUDIT_DATA = [
  {
    id: 1,
    plate: 'CAK 1234',
    makeModel: 'Toyota Corolla (White)',
    dateTime: '2025-06-16 13:28:14',
    location: 'Galle (Km 112.4)',
    highway: 'E01 Southern Expressway',
    lane: 'Lane 2',
    detectedSpeed: 118,
    speedLimit: 100,
    difference: 18,
    status: 'Violation',
    owner: 'Nimal Jayawardena',
    nic: '841920394V',
    fineAmount: 'LKR 3,000',
    dueDate: '2025-06-30'
  },
  {
    id: 2,
    plate: 'WP KD 7788',
    makeModel: 'Honda Civic (Black)',
    dateTime: '2025-06-16 13:24:37',
    location: 'Homagama (Km 98.7)',
    highway: 'E01 Southern Expressway',
    lane: 'Lane 1',
    detectedSpeed: 96,
    speedLimit: 100,
    difference: -4,
    status: 'Normal',
    owner: 'Kasun Wickramasinghe',
    nic: '912830491V',
    fineAmount: null,
    dueDate: null
  },
  {
    id: 3,
    plate: 'NC 4567',
    makeModel: 'Nissan X-Trail (Silver)',
    dateTime: '2025-06-16 13:21:03',
    location: 'Kottawa (Km 89.2)',
    highway: 'E01 Southern Expressway',
    lane: 'Lane 3',
    detectedSpeed: 142,
    speedLimit: 100,
    difference: 42,
    status: 'Violation',
    owner: 'Priyashantha Dissanayake',
    nic: '772910482V',
    fineAmount: 'LKR 5,000',
    dueDate: '2025-06-30'
  },
  {
    id: 4,
    plate: 'CBF 5521',
    makeModel: 'Suzuki Alto (Blue)',
    dateTime: '2025-06-16 13:18:49',
    location: 'Colombo (Km 75.8)',
    highway: 'E01 Southern Expressway',
    lane: 'Lane 2',
    detectedSpeed: 88,
    speedLimit: 100,
    difference: -12,
    status: 'Normal',
    owner: 'Chamari Gunawardena',
    nic: '958291029V',
    fineAmount: null,
    dueDate: null
  },
  {
    id: 5,
    plate: 'WP KX 2288',
    makeModel: 'Toyota Prius (Gray)',
    dateTime: '2025-06-16 13:15:22',
    location: 'Panadura (Km 63.1)',
    highway: 'E01 Southern Expressway',
    lane: 'Lane 1',
    detectedSpeed: 105,
    speedLimit: 100,
    difference: 5,
    status: 'Warning',
    owner: 'Sunil Weerakkody',
    nic: '802910392V',
    fineAmount: 'Advisory Warning',
    dueDate: null
  },
  {
    id: 6,
    plate: 'SP 9473',
    makeModel: 'Mitsubishi Lancer (White)',
    dateTime: '2025-06-16 13:12:07',
    location: 'Kalutara (Km 54.6)',
    highway: 'E01 Southern Expressway',
    lane: 'Lane 3',
    detectedSpeed: 76,
    speedLimit: 100,
    difference: -24,
    status: 'Normal',
    owner: 'Roshan Fernando',
    nic: '882910394V',
    fineAmount: null,
    dueDate: null
  },
  {
    id: 7,
    plate: 'CAK 6622',
    makeModel: 'Isuzu D-Max (Black)',
    dateTime: '2025-06-16 13:08:56',
    location: 'Beruwala (Km 42.3)',
    highway: 'E01 Southern Expressway',
    lane: 'Lane 2',
    detectedSpeed: 121,
    speedLimit: 100,
    difference: 21,
    status: 'Violation',
    owner: 'Mohamed Rizvi',
    nic: '832910492V',
    fineAmount: 'LKR 3,000',
    dueDate: '2025-06-30'
  },
  {
    id: 8,
    plate: 'BKV 3154',
    makeModel: 'Honda Fit (Red)',
    dateTime: '2025-06-16 13:05:32',
    location: 'Bentota (Km 37.9)',
    highway: 'E01 Southern Expressway',
    lane: 'Lane 1',
    detectedSpeed: 69,
    speedLimit: 100,
    difference: -31,
    status: 'Normal',
    owner: 'Tharindu Perera',
    nic: '932810394V',
    fineAmount: null,
    dueDate: null
  },
  {
    id: 9,
    plate: 'WP PK 7733',
    makeModel: 'Land Cruiser (Black)',
    dateTime: '2025-06-16 13:02:11',
    location: 'Ahungalla (Km 28.4)',
    highway: 'E01 Southern Expressway',
    lane: 'Lane 3',
    detectedSpeed: 110,
    speedLimit: 100,
    difference: 10,
    status: 'Violation',
    owner: 'Anura Kumara Silva',
    nic: '752910394V',
    fineAmount: 'LKR 3,000',
    dueDate: '2025-06-30'
  },
  {
    id: 10,
    plate: 'KAT 1189',
    makeModel: 'Tata Nano (Yellow)',
    dateTime: '2025-06-16 12:58:46',
    location: 'Induruwa (Km 21.7)',
    highway: 'E01 Southern Expressway',
    lane: 'Lane 2',
    detectedSpeed: 82,
    speedLimit: 100,
    difference: -18,
    status: 'Normal',
    owner: 'Gayan Ratnayake',
    nic: '962910394V',
    fineAmount: null,
    dueDate: null
  }
];

export default function SpeedViolationAuditTab({ isDarkMode = true, onNotification }) {
  // Filter States
  const [dateTimeRange, setDateTimeRange] = useState('2025-06-16 00:00 - 2025-06-16 23:59');
  const [selectedHighway, setSelectedHighway] = useState('E01 Southern Expressway');
  const [selectedLane, setSelectedLane] = useState('All');
  const [searchPlate, setSearchPlate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals & UI States
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [selectedChallan, setSelectedChallan] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveAuditModal, setShowSaveAuditModal] = useState(false);
  const [reportName, setReportName] = useState('E01 Speed Audit - 04 Oct 2026');
  const [reportDateRange, setReportDateRange] = useState('04 Oct 2026 00:00  →  04 Oct 2026 23:59');
  const [reportHighway, setReportHighway] = useState('E01 Southern Expressway');

  // Export Modal States
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('CSV');
  const [exportScope, setExportScope] = useState('all');
  const [exportColumns, setExportColumns] = useState({
    plate: true,
    dateTime: true,
    location: true,
    lane: true,
    detectedSpeed: true,
    speedLimit: true,
    difference: true,
    status: true
  });

  // Filtered Records
  const filteredData = useMemo(() => {
    return INITIAL_AUDIT_DATA.filter((item) => {
      // Highway match
      if (selectedHighway !== 'All' && !item.highway.toLowerCase().includes(selectedHighway.toLowerCase().split(' ')[0])) {
        if (selectedHighway === 'E01 Southern Expressway' && !item.highway.includes('E01')) return false;
      }
      // Lane match
      if (selectedLane !== 'All' && item.lane !== selectedLane) {
        return false;
      }
      // Status match
      if (statusFilter !== 'All') {
        if (statusFilter === 'Violation' && item.status !== 'Violation') return false;
        if (statusFilter === 'Normal' && item.status !== 'Normal') return false;
        if (statusFilter === 'Warning' && item.status !== 'Warning') return false;
      }
      // Plate search match
      if (searchPlate.trim()) {
        const query = searchPlate.trim().toLowerCase();
        const matchesPlate = item.plate.toLowerCase().includes(query);
        const matchesModel = item.makeModel.toLowerCase().includes(query);
        const matchesLocation = item.location.toLowerCase().includes(query);
        if (!matchesPlate && !matchesModel && !matchesLocation) return false;
      }
      return true;
    });
  }, [selectedHighway, selectedLane, statusFilter, searchPlate]);

  // Reset Filters
  const handleReset = () => {
    setDateTimeRange('2025-06-16 00:00 - 2025-06-16 23:59');
    setSelectedHighway('E01 Southern Expressway');
    setSelectedLane('All');
    setSearchPlate('');
    setStatusFilter('All');
    setCurrentPage(1);
    if (onNotification) onNotification('Filters Reset', 'Audit filters restored to default parameters', 'info');
  };

  // Download PDF directly with html2pdf.js
  const handleDownloadPdfFile = () => {
    setIsExporting(true);
    const element = document.getElementById('audit-report-pdf-root');
    if (!element) {
      setIsExporting(false);
      return;
    }

    const opt = {
      margin: 0,
      filename: `Speed_Violation_Audit_Report_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
        windowWidth: 794
      },
      jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait', hotfixes: ['px_scaling'] },
      pagebreak: { mode: 'avoid-all' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setIsExporting(false);
      if (onNotification) {
        onNotification('PDF Downloaded', 'Audit report PDF generated and downloaded successfully', 'success');
      }
    }).catch((err) => {
      console.error('Error generating PDF with html2pdf:', err);
      setIsExporting(false);
      // Fallback
      window.print();
    });
  };

  // Export Violations (CSV or PDF)
  const handleExecuteExport = () => {
    setShowExportModal(false);

    if (exportFormat === 'PDF') {
      setIsExporting(true);
      setTimeout(() => {
        handleDownloadPdfFile();
      }, 300);
      return;
    }

    setIsExporting(true);
    setTimeout(() => {
      let rowsToExport = filteredData;
      if (exportScope === 'violations') {
        rowsToExport = filteredData.filter(i => i.status === 'Violation');
      } else if (exportScope === 'page') {
        const startIndex = (currentPage - 1) * 10;
        rowsToExport = filteredData.slice(startIndex, startIndex + 10);
      }

      const headers = [];
      if (exportColumns.plate) headers.push('Vehicle / Plate');
      if (exportColumns.dateTime) headers.push('Date & Time');
      if (exportColumns.location) headers.push('Location');
      if (exportColumns.lane) headers.push('Lane');
      if (exportColumns.detectedSpeed) headers.push('Detected Speed (km/h)');
      if (exportColumns.speedLimit) headers.push('Speed Limit (km/h)');
      if (exportColumns.difference) headers.push('Difference (km/h)');
      if (exportColumns.status) headers.push('Violation Status');

      const rows = rowsToExport.map(item => {
        const row = [];
        if (exportColumns.plate) row.push(`"${item.plate}"`);
        if (exportColumns.dateTime) row.push(`"${item.dateTime}"`);
        if (exportColumns.location) row.push(`"${item.location}"`);
        if (exportColumns.lane) row.push(`"${item.lane}"`);
        if (exportColumns.detectedSpeed) row.push(item.detectedSpeed);
        if (exportColumns.speedLimit) row.push(item.speedLimit);
        if (exportColumns.difference) row.push(item.difference);
        if (exportColumns.status) row.push(item.status);
        return row;
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Speed_Violation_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      if (onNotification) {
        onNotification('Report Exported', `CSV report with ${rowsToExport.length} records generated successfully`, 'success');
      }
    }, 400);
  };

  // Save Audit Report
  const handleSaveReport = () => {
    setShowSaveAuditModal(true);
  };

  const handleConfirmSaveReport = () => {
    setShowSaveAuditModal(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    if (onNotification) {
      onNotification('Audit Report Saved', `Report "${reportName}" saved to database archive`, 'success');
    }
  };

  return (
    <div className={`space-y-3.5 font-sans transition-colors duration-200 ${
      isDarkMode ? 'text-slate-100' : 'text-slate-800'
    }`}>
      {/* ------------------------------------------------------------- */}
      {/* 1. HEADER TITLE & ACTION BUTTONS */}
      {/* ------------------------------------------------------------- */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border transition-colors shadow-sm ${
        isDarkMode
          ? 'bg-slate-900/90 border-slate-800/90 shadow-slate-950/40'
          : 'bg-white border-slate-200/90 shadow-slate-200/40'
      }`}>
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#0088cc] flex items-center justify-center text-white shadow-md shadow-sky-500/25 flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-xl font-bold tracking-tight flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Speed & Violation Audit
            </h1>
            <p className={`text-xs mt-1 max-w-2xl leading-relaxed ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              Automatically detect vehicle speeds on highways and generate a complete vehicle audit report for every detected vehicle — including both normal and violation cases.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0 self-end md:self-center">
          <button
            onClick={handleSaveReport}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm ${
              isSaved
                ? 'bg-emerald-600 text-white'
                : 'bg-[#0066cc] hover:bg-[#0055b3] text-white active:scale-95'
            }`}
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Audit Saved!' : 'Save Audit Report'}</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0066cc] hover:bg-[#0055b3] text-white flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export Report (CSV/PDF)'}</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. FOUR METRIC SUMMARY CARDS */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Vehicles */}
        <div className={`p-4 rounded-2xl border transition-colors shadow-sm flex items-center gap-3.5 ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800/90' : 'bg-white border-slate-200/90'
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isDarkMode ? 'bg-sky-950/70 border border-sky-800/50 text-sky-400' : 'bg-sky-100/90 text-sky-600'
          }`}>
            <Car className="w-6 h-6" />
          </div>
          <div>
            <span className={`text-[11px] font-medium uppercase tracking-wider block ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>Total Vehicles</span>
            <span className={`text-2xl font-black leading-tight block ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>2,487</span>
            <span className={`text-[11px] font-semibold flex items-center gap-0.5 mt-0.5 ${
              isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
            }`}>
              <span>↑ 12%</span> <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-400'} font-normal`}>vs. previous period</span>
            </span>
          </div>
        </div>

        {/* Speed Violations */}
        <div className={`p-4 rounded-2xl border transition-colors shadow-sm flex items-center gap-3.5 ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800/90' : 'bg-white border-slate-200/90'
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isDarkMode ? 'bg-rose-950/70 border border-rose-800/50 text-rose-400' : 'bg-rose-100/90 text-rose-500'
          }`}>
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className={`text-[11px] font-medium uppercase tracking-wider block ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>Speed Violations</span>
            <span className={`text-2xl font-black leading-tight block ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>312</span>
            <span className={`text-[11px] font-medium mt-0.5 block ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <strong className={isDarkMode ? 'text-rose-400 font-semibold' : 'text-rose-600 font-semibold'}>12.6%</strong> of total vehicles
            </span>
          </div>
        </div>

        {/* Warnings */}
        <div className={`p-4 rounded-2xl border transition-colors shadow-sm flex items-center gap-3.5 ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800/90' : 'bg-white border-slate-200/90'
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isDarkMode ? 'bg-amber-950/70 border border-amber-800/50 text-amber-400' : 'bg-amber-100/90 text-amber-500'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className={`text-[11px] font-medium uppercase tracking-wider block ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>Warnings</span>
            <span className={`text-2xl font-black leading-tight block ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>86</span>
            <span className={`text-[11px] font-medium mt-0.5 block ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
              <strong className={isDarkMode ? 'text-amber-400 font-semibold' : 'text-amber-600 font-semibold'}>3.5%</strong> of total vehicles
            </span>
          </div>
        </div>

        {/* Average Speed */}
        <div className={`p-4 rounded-2xl border transition-colors shadow-sm flex items-center gap-3.5 ${
          isDarkMode ? 'bg-slate-900/90 border-slate-800/90' : 'bg-white border-slate-200/90'
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isDarkMode ? 'bg-sky-950/70 border border-sky-800/50 text-sky-400' : 'bg-sky-100/90 text-sky-600'
          }`}>
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <span className={`text-[11px] font-medium uppercase tracking-wider block ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>Average Speed</span>
            <span className={`text-2xl font-black leading-tight block ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>82 km/h</span>
            <span className={`text-[11px] font-semibold flex items-center gap-0.5 mt-0.5 ${
              isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
            }`}>
              <span>↓ 6%</span> <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-400'} font-normal`}>vs. previous period</span>
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. SEARCH & FILTER CONTROLS BAR */}
      {/* ------------------------------------------------------------- */}
      <div className={`p-4 rounded-2xl border transition-colors shadow-sm ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800/90' : 'bg-white border-slate-200/90'
      }`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
          {/* Date & Time Range */}
          <div>
            <label className={`flex items-center gap-1.5 text-xs font-semibold mb-1.5 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span>Date & Time Range</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={dateTimeRange}
                onChange={(e) => setDateTimeRange(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-mono transition-all outline-none border ${
                  isDarkMode
                    ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-sky-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-sky-500'
                }`}
              />
            </div>
          </div>

          {/* Highway / Location */}
          <div>
            <label className={`flex items-center gap-1.5 text-xs font-semibold mb-1.5 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              <span>Highway / Location</span>
            </label>
            <select
              value={selectedHighway}
              onChange={(e) => setSelectedHighway(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-xs font-medium transition-all outline-none border ${
                isDarkMode
                  ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-sky-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-sky-500'
              }`}
            >
              <option value="E01 Southern Expressway">E01 Southern Expressway</option>
              <option value="E02 Outer Circular Expressway">E02 Outer Circular Expressway</option>
              <option value="E03 Katunayake Expressway">E03 Katunayake Expressway</option>
              <option value="E04 Central Expressway">E04 Central Expressway</option>
              <option value="All">All Corridors (Entire Island)</option>
            </select>
          </div>

          {/* Lane */}
          <div>
            <label className={`flex items-center gap-1.5 text-xs font-semibold mb-1.5 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              <Route className="w-3.5 h-3.5 text-sky-400" />
              <span>Lane</span>
            </label>
            <select
              value={selectedLane}
              onChange={(e) => setSelectedLane(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-xs font-medium transition-all outline-none border ${
                isDarkMode
                  ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-sky-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-sky-500'
              }`}
            >
              <option value="All">/|\ All Lanes</option>
              <option value="Lane 1">Lane 1 (Overtaking)</option>
              <option value="Lane 2">Lane 2 (Cruising)</option>
              <option value="Lane 3">Lane 3 (Slow / Heavy)</option>
            </select>
          </div>

          {/* Plate Number */}
          <div>
            <label className={`flex items-center gap-1.5 text-xs font-semibold mb-1.5 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              <Car className="w-3.5 h-3.5 text-sky-400" />
              <span>Plate Number</span>
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. CAK 1234"
                value={searchPlate}
                onChange={(e) => setSearchPlate(e.target.value)}
                className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs transition-all outline-none border ${
                  isDarkMode
                    ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-sky-500 placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-sky-500'
                }`}
              />
            </div>
          </div>

          {/* Status & Action Buttons */}
          <div>
            <label className={`flex items-center gap-1.5 text-xs font-semibold mb-1.5 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              <Filter className="w-3.5 h-3.5 text-sky-400" />
              <span>Status</span>
            </label>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-medium transition-all outline-none border ${
                  isDarkMode
                    ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-sky-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-sky-500'
                }`}
              >
                <option value="All">All (Normal + Violation)</option>
                <option value="Violation">Violation Only</option>
                <option value="Normal">Normal Only</option>
                <option value="Warning">Warning Only</option>
              </select>

              <button
                onClick={handleReset}
                title="Reset Filters"
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-all ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. SPEED & VIOLATION AUDIT DATA TABLE */}
      {/* ------------------------------------------------------------- */}
      <div className={`rounded-2xl overflow-hidden border transition-colors shadow-sm ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800/90' : 'bg-white border-slate-200/90'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDarkMode
                  ? 'bg-slate-950/80 border-slate-800 text-slate-400'
                  : 'bg-[#f8fafc] border-slate-200 text-slate-600'
              }`}>
                <th className="py-3 px-3.5 text-center w-10">#</th>
                <th className="py-3 px-3.5">
                  <div className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-slate-400" />
                    <span>Vehicle / Plate</span>
                  </div>
                </th>
                <th className="py-3 px-3.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Date & Time</span>
                  </div>
                </th>
                <th className="py-3 px-3.5">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Location</span>
                  </div>
                </th>
                <th className="py-3 px-3.5">
                  <div className="flex items-center gap-1.5">
                    <Route className="w-3.5 h-3.5 text-slate-400" />
                    <span>Lane</span>
                  </div>
                </th>
                <th className="py-3 px-3.5">
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-slate-400" />
                    <span>Detected Speed</span>
                  </div>
                </th>
                <th className="py-3 px-3.5">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Speed Limit</span>
                  </div>
                </th>
                <th className="py-3 px-3.5">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Difference</span>
                  </div>
                </th>
                <th className="py-3 px-3.5">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                    <span>Status</span>
                  </div>
                </th>
                <th className="py-3 px-3.5 text-center">Evidence</th>
                <th className="py-3 px-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs transition-colors ${
              isDarkMode
                ? 'divide-slate-800/80 text-slate-200'
                : 'divide-slate-100 text-slate-700'
            }`}>
              {filteredData.length > 0 ? (
                filteredData.map((row) => {
                  const isViolation = row.status === 'Violation';
                  const isWarning = row.status === 'Warning';
                  const isNormal = row.status === 'Normal';

                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors duration-150 ${
                        isDarkMode
                          ? 'hover:bg-slate-800/60'
                          : 'hover:bg-sky-50/50'
                      }`}
                    >
                      {/* # */}
                      <td className={`py-3 px-3.5 text-center font-bold ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {row.id}
                      </td>

                      {/* Vehicle / Plate */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <Car className="w-4 h-4" />
                          </div>
                          <div>
                            <div className={`font-bold font-mono tracking-tight text-xs ${
                              isDarkMode ? 'text-white' : 'text-slate-900'
                            }`}>
                              {row.plate}
                            </div>
                            <div className={`text-[11px] ${
                              isDarkMode ? 'text-slate-400' : 'text-slate-500'
                            }`}>
                              {row.makeModel}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className={`py-3 px-3.5 font-mono text-[11px] whitespace-nowrap ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {row.dateTime}
                      </td>

                      {/* Location */}
                      <td className={`py-3 px-3.5 font-medium ${
                        isDarkMode ? 'text-slate-200' : 'text-slate-700'
                      }`}>
                        {row.location}
                      </td>

                      {/* Lane */}
                      <td className={`py-3 px-3.5 ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        {row.lane}
                      </td>

                      {/* Detected Speed */}
                      <td className="py-3 px-3.5">
                        <span className={`font-black font-mono text-xs ${
                          isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          {row.detectedSpeed} km/h
                        </span>
                      </td>

                      {/* Speed Limit */}
                      <td className={`py-3 px-3.5 font-mono text-xs ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}>
                        {row.speedLimit} km/h
                      </td>

                      {/* Difference */}
                      <td className="py-3 px-3.5 font-mono font-bold text-xs">
                        {row.difference > 0 ? (
                          <span className={
                            isViolation
                              ? isDarkMode ? 'text-rose-400' : 'text-rose-600'
                              : isDarkMode ? 'text-amber-400' : 'text-amber-600'
                          }>
                            +{row.difference} km/h
                          </span>
                        ) : (
                          <span className={isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}>
                            {row.difference} km/h
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5">
                        {isViolation && (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            isDarkMode
                              ? 'bg-rose-950/60 border-rose-800/60 text-rose-300'
                              : 'bg-rose-50 border-rose-200 text-rose-600'
                          }`}>
                            <AlertCircle className="w-3 h-3 text-rose-500" />
                            <span>Violation</span>
                          </span>
                        )}
                        {isWarning && (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            isDarkMode
                              ? 'bg-amber-950/60 border-amber-800/60 text-amber-300'
                              : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}>
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            <span>Warning</span>
                          </span>
                        )}
                        {isNormal && (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            isDarkMode
                              ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          }`}>
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Normal</span>
                          </span>
                        )}
                      </td>

                      {/* Evidence (Plate Crop Thumbnail) */}
                      <td className="py-2.5 px-3.5 text-center">
                        <div
                          onClick={() => setSelectedEvidence(row)}
                          className="inline-block cursor-pointer group"
                          title="Click to zoom evidence"
                        >
                          <div className={`w-20 h-7 rounded flex items-center justify-center px-1 shadow-sm transition-all border ${
                            isDarkMode
                              ? 'bg-slate-950 border-slate-700 group-hover:border-sky-400'
                              : 'bg-slate-900 border-slate-700 group-hover:border-sky-500'
                          }`}>
                            <span className="text-[10px] font-black font-mono text-slate-100 tracking-wider group-hover:text-amber-300">
                              {row.plate}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedEvidence(row)}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-all ${
                              isDarkMode
                                ? 'border-sky-500/40 text-sky-400 hover:bg-sky-950/50 hover:border-sky-400'
                                : 'border-sky-300 text-sky-600 hover:bg-sky-50 hover:border-sky-500'
                            }`}
                            title="Inspect high-definition camera capture & optical telemetry"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Evidence</span>
                          </button>

                          <button
                            onClick={() => setSelectedChallan(row)}
                            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-all ${
                              isDarkMode
                                ? 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                            title="Inspect official Sri Lanka e-Challan citation dossier"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="11" className={`text-center py-10 ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold">No audit records match your current filter criteria</p>
                    <button
                      onClick={handleReset}
                      className="mt-2 text-xs text-sky-500 hover:underline font-semibold"
                    >
                      Reset all filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 5. TABLE FOOTER & PAGINATION */}
        {/* ------------------------------------------------------------- */}
        <div className={`p-3.5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
          isDarkMode
            ? 'bg-slate-950/80 border-slate-800 text-slate-400'
            : 'bg-[#f8fafc] border-slate-200 text-slate-500'
        }`}>
          <div>
            Showing <strong className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>1 - {Math.min(filteredData.length, 10)}</strong> of{' '}
            <strong className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>2,487</strong> vehicles
          </div>

          <div className="flex items-center space-x-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className={`p-1 rounded-lg border disabled:opacity-30 ${
                isDarkMode
                  ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {[1, 2, 3, 4, 5].map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  currentPage === pageNum
                    ? 'bg-[#0088cc] text-white shadow-sm'
                    : isDarkMode
                    ? 'text-slate-300 hover:bg-slate-800'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <span className="px-1 text-slate-500">...</span>

            <button
              onClick={() => setCurrentPage(249)}
              className={`w-8 h-7 rounded-lg text-xs font-semibold ${
                isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              249
            </button>

            <button
              onClick={() => setCurrentPage(p => Math.min(249, p + 1))}
              className={`p-1 rounded-lg border ${
                isDarkMode
                  ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 6. MODAL: VIEW EVIDENCE INSPECTOR */}
      {/* ------------------------------------------------------------- */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            {/* Modal Header */}
            <div className={`px-5 py-3.5 border-b flex items-center justify-between ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 border-slate-800 text-white'
            }`}>
              <div className="flex items-center gap-2.5">
                <Eye className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-white">
                    Optical Evidence Dossier • {selectedEvidence.plate}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    High-Definition CCTV Telemetry Capture (Km Marker: {selectedEvidence.location})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className={`p-5 space-y-4 ${
              isDarkMode ? 'bg-slate-950/60' : 'bg-slate-50'
            }`}>
              {/* Surveillance Simulated Frame */}
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <img
                  src={`/camera_01_live.jpg`}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/sample_camera_output.jpg';
                  }}
                  alt="Captured vehicle frame"
                  className="w-full h-full object-cover"
                />

                {/* Overlaid Target Bounding Box & HUD */}
                <div className="absolute inset-0 flex flex-col justify-between p-3.5 pointer-events-none">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono bg-black/80 backdrop-blur px-2.5 py-1 rounded text-cyan-400 border border-cyan-500/30">
                      SEC-CAM: {selectedEvidence.location} [YOLOv8 ByteTrack]
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border ${
                        selectedEvidence.status === 'Violation'
                          ? 'bg-rose-950/90 text-rose-300 border-rose-500/40'
                          : 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {selectedEvidence.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-black/80 backdrop-blur p-2.5 rounded-xl border border-slate-700 max-w-sm">
                    <div className="text-[11px] text-slate-300 font-mono">
                      RECORDED SPEED: <strong className="text-white text-xs">{selectedEvidence.detectedSpeed} km/h</strong> (Limit: {selectedEvidence.speedLimit} km/h)
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      DELTA: <span className={selectedEvidence.difference > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                        {selectedEvidence.difference > 0 ? `+${selectedEvidence.difference}` : selectedEvidence.difference} km/h
                      </span> • ANPR MATCH: {selectedEvidence.plate}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle & Plate Data Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className={`p-2.5 rounded-xl border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <span className={`text-[10px] uppercase font-semibold block ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-400'
                  }`}>Vehicle Plate</span>
                  <span className={`font-bold font-mono mt-0.5 block ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>{selectedEvidence.plate}</span>
                </div>
                <div className={`p-2.5 rounded-xl border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <span className={`text-[10px] uppercase font-semibold block ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-400'
                  }`}>Make & Model</span>
                  <span className={`font-medium mt-0.5 block truncate ${
                    isDarkMode ? 'text-slate-200' : 'text-slate-800'
                  }`}>{selectedEvidence.makeModel}</span>
                </div>
                <div className={`p-2.5 rounded-xl border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <span className={`text-[10px] uppercase font-semibold block ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-400'
                  }`}>Lane / Corridor</span>
                  <span className={`font-medium mt-0.5 block ${
                    isDarkMode ? 'text-slate-200' : 'text-slate-800'
                  }`}>{selectedEvidence.lane}</span>
                </div>
                <div className={`p-2.5 rounded-xl border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <span className={`text-[10px] uppercase font-semibold block ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-400'
                  }`}>Timestamp</span>
                  <span className={`font-mono text-[11px] mt-0.5 block ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>{selectedEvidence.dateTime}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`px-5 py-3 border-t flex items-center justify-between ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <span className={`text-[11px] ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Tamper-Proof SHA-256 Checksum: <code className={isDarkMode ? 'text-sky-400' : 'text-slate-700'}>e82a...91bc</code>
              </span>
              <button
                onClick={() => {
                  setSelectedChallan(selectedEvidence);
                  setSelectedEvidence(null);
                }}
                className="px-3.5 py-1.5 bg-[#0088cc] hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Full e-Challan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. MODAL: OFFICIAL E-CHALLAN CITATION DOSSIER */}
      {/* ------------------------------------------------------------- */}
      {selectedChallan && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-300 text-slate-800'
          }`}>
            {/* Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight uppercase">
                    Official Sri Lanka e-Challan Notice
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Ref: SL-TMC-2025-0616-{String(selectedChallan.id).padStart(4, '0')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedChallan(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Challan Body (Printable Official Citation Template) */}
            <div className={`p-6 space-y-4 overflow-y-auto ${
              isDarkMode ? 'bg-slate-950/60 text-slate-200' : 'bg-slate-50 text-slate-800'
            }`}>
              {/* Official Emblems & Authority */}
              <div className={`text-center pb-3 border-b ${
                isDarkMode ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <h4 className={`text-xs font-black uppercase tracking-wider ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Democratic Socialist Republic of Sri Lanka
                </h4>
                <p className={`text-[11px] mt-0.5 ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Sri Lanka Police Traffic Headquarters & Road Development Authority (RDA)
                </p>
                <span className={`inline-block mt-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono ${
                  isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                }`}>
                  Motor Traffic Act No. 14 of 1951 (Amended)
                </span>
              </div>

              {/* Status Banner */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                selectedChallan.status === 'Violation'
                  ? isDarkMode
                    ? 'bg-rose-950/50 border-rose-800/60 text-rose-300'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                  : isDarkMode
                  ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <div className="flex items-center gap-2">
                  {selectedChallan.status === 'Violation' ? (
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  )}
                  <div>
                    <span className="text-xs font-bold block">
                      {selectedChallan.status === 'Violation'
                        ? 'Traffic Infringement Recorded'
                        : 'Speed Compliance Verified'}
                    </span>
                    <span className="text-[11px] opacity-80">
                      {selectedChallan.status === 'Violation'
                        ? `Recorded speed exceeded legal expressway limit by +${selectedChallan.difference} km/h`
                        : 'Vehicle observed within legal corridor speed limits'}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs font-bold block">
                    {selectedChallan.fineAmount || 'No Penalty'}
                  </span>
                  {selectedChallan.dueDate && (
                    <span className={`text-[10px] ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>Due: {selectedChallan.dueDate}</span>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div className={`p-4 rounded-xl border space-y-2.5 text-xs ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className={`grid grid-cols-2 gap-3 pb-2 border-b ${
                  isDarkMode ? 'border-slate-800' : 'border-slate-100'
                }`}>
                  <div>
                    <span className={`text-[10px] font-semibold uppercase block ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-400'
                    }`}>Registration No</span>
                    <span className={`font-bold font-mono text-sm ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>{selectedChallan.plate}</span>
                  </div>
                  <div>
                    <span className={`text-[10px] font-semibold uppercase block ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-400'
                    }`}>Vehicle Make / Model</span>
                    <span className={`font-semibold ${
                      isDarkMode ? 'text-slate-200' : 'text-slate-800'
                    }`}>{selectedChallan.makeModel}</span>
                  </div>
                </div>

                <div className={`grid grid-cols-2 gap-3 pb-2 border-b ${
                  isDarkMode ? 'border-slate-800' : 'border-slate-100'
                }`}>
                  <div>
                    <span className={`text-[10px] font-semibold uppercase block ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-400'
                    }`}>Registered Owner</span>
                    <span className={`font-semibold ${
                      isDarkMode ? 'text-slate-200' : 'text-slate-800'
                    }`}>{selectedChallan.owner}</span>
                  </div>
                  <div>
                    <span className={`text-[10px] font-semibold uppercase block ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-400'
                    }`}>NIC Number</span>
                    <span className={`font-mono ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>{selectedChallan.nic}</span>
                  </div>
                </div>

                <div className={`grid grid-cols-2 gap-3 pb-2 border-b ${
                  isDarkMode ? 'border-slate-800' : 'border-slate-100'
                }`}>
                  <div>
                    <span className={`text-[10px] font-semibold uppercase block ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-400'
                    }`}>Date & Time</span>
                    <span className={`font-mono ${
                      isDarkMode ? 'text-slate-200' : 'text-slate-800'
                    }`}>{selectedChallan.dateTime}</span>
                  </div>
                  <div>
                    <span className={`text-[10px] font-semibold uppercase block ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-400'
                    }`}>Location / Corridor</span>
                    <span className={`font-semibold ${
                      isDarkMode ? 'text-slate-200' : 'text-slate-800'
                    }`}>{selectedChallan.location}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                  <div className={`p-2 rounded-lg border ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <span className={`text-[10px] block ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-400'
                    }`}>SPEED LIMIT</span>
                    <span className={`text-xs font-bold ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>{selectedChallan.speedLimit} km/h</span>
                  </div>
                  <div className={`p-2 rounded-lg border ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <span className={`text-[10px] block ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-400'
                    }`}>DETECTED SPEED</span>
                    <span className={`text-xs font-black ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>{selectedChallan.detectedSpeed} km/h</span>
                  </div>
                  <div className={`p-2 rounded-lg border ${
                    selectedChallan.difference > 0
                      ? isDarkMode
                        ? 'bg-rose-950/60 border-rose-800/60 text-rose-300'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                      : isDarkMode
                      ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}>
                    <span className="text-[10px] opacity-75 block">DELTA</span>
                    <span className="text-xs font-bold">
                      {selectedChallan.difference > 0 ? `+${selectedChallan.difference}` : selectedChallan.difference} km/h
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Verification & Instructions */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="space-y-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Online Fine Settlement Portal
                  </span>
                  <p className={`text-[11px] max-w-xs ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Pay online via LankaPay, Commercial Bank, or BOC online banking using this notice reference number.
                  </p>
                </div>
                <div className={`p-1.5 rounded-lg border ${
                  isDarkMode ? 'bg-white text-slate-900 border-white' : 'bg-slate-100 text-slate-800 border-slate-200'
                }`}>
                  <QrCode className="w-10 h-10" />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className={`px-6 py-3.5 border-t flex items-center justify-between ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <button
                onClick={() => window.print()}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                  isDarkMode
                    ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                    : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Notice</span>
              </button>

              <button
                onClick={() => setSelectedChallan(null)}
                className="px-5 py-2 bg-[#0088cc] hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/25 transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ------------------------------------------------------------- */}
      {/* 8. SAVE AUDIT REPORT MODAL (MATCHING USER TEMPLATE) */}
      {/* ------------------------------------------------------------- */}
      {showSaveAuditModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-700/80 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between transition-colors ${
              isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-white'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <Save className="w-4 h-4" />
                </div>
                <h2 className={`text-base font-bold tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Save Audit Report
                </h2>
              </div>
              <button
                onClick={() => setShowSaveAuditModal(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Report Name */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Report Name
                </label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-medium border focus:outline-none focus:border-sky-500 transition-colors ${
                    isDarkMode 
                      ? 'bg-slate-950 border-slate-700 text-white' 
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Date Range */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Date Range
                </label>
                <div className="relative">
                  <Calendar className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`} />
                  <input
                    type="text"
                    value={reportDateRange}
                    onChange={(e) => setReportDateRange(e.target.value)}
                    className={`w-full rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-medium border focus:outline-none focus:border-sky-500 transition-colors ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-700 text-white' 
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Highway */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Highway
                </label>
                <div className="relative">
                  <Route className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`} />
                  <input
                    type="text"
                    value={reportHighway}
                    onChange={(e) => setReportHighway(e.target.value)}
                    className={`w-full rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-medium border focus:outline-none focus:border-sky-500 transition-colors ${
                      isDarkMode 
                        ? 'bg-slate-950 border-slate-700 text-white' 
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Report Summary Cards */}
              <div>
                <label className={`block text-xs font-bold mb-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Report Summary
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {/* Total Vehicles */}
                  <div className={`p-3 rounded-xl border text-center flex flex-col items-center justify-between transition-colors ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}>
                    <div className="text-sky-500 mb-1">
                      <Car className="w-5 h-5 mx-auto" />
                    </div>
                    <span className={`text-[10px] block ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Total Vehicles
                    </span>
                    <span className={`text-sm font-extrabold block mt-0.5 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      2,487
                    </span>
                  </div>

                  {/* Speed Violations */}
                  <div className={`p-3 rounded-xl border text-center flex flex-col items-center justify-between transition-colors ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}>
                    <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs mb-1">
                      !
                    </div>
                    <span className={`text-[10px] block ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Speed Violations
                    </span>
                    <span className={`text-sm font-extrabold block mt-0.5 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      312
                    </span>
                  </div>

                  {/* Warnings */}
                  <div className={`p-3 rounded-xl border text-center flex flex-col items-center justify-between transition-colors ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}>
                    <div className="text-amber-500 mb-1">
                      <AlertTriangle className="w-5 h-5 mx-auto fill-amber-500 text-amber-500" />
                    </div>
                    <span className={`text-[10px] block ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Warnings
                    </span>
                    <span className={`text-sm font-extrabold block mt-0.5 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      86
                    </span>
                  </div>

                  {/* Normal */}
                  <div className={`p-3 rounded-xl border text-center flex flex-col items-center justify-between transition-colors ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}>
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs mb-1">
                      ✓
                    </div>
                    <span className={`text-[10px] block ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Normal
                    </span>
                    <span className={`text-sm font-extrabold block mt-0.5 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      2,089
                    </span>
                  </div>
                </div>
              </div>

              {/* Generated By */}
              <div>
                <label className={`block text-xs font-bold mb-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Generated By
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#005a80] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">
                    RS
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      R. Senanayake
                    </div>
                    <div className={`text-[11px] ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      TMC Administrator
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className={`px-6 py-4 border-t flex items-center justify-end gap-3 transition-colors ${
              isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <button
                onClick={() => setShowSaveAuditModal(false)}
                className={`px-5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  isDarkMode 
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800' 
                    : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmSaveReport}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#0066cc] hover:bg-[#0055b3] text-white flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save Audit Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ------------------------------------------------------------- */}
      {/* 9. EXPORT VIOLATION RECORDS MODAL (MATCHING USER TEMPLATE) */}
      {/* ------------------------------------------------------------- */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-700/80 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between transition-colors ${
              isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-white'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <h2 className={`text-base font-bold tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  Export Violation Records
                </h2>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 text-xs">
              {/* Export Format */}
              <div>
                <label className={`block font-bold mb-2.5 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-800'
                }`}>
                  Export Format
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="CSV"
                      checked={exportFormat === 'CSV'}
                      onChange={() => setExportFormat('CSV')}
                      className="w-4 h-4 text-[#0066cc] accent-[#0066cc] cursor-pointer"
                    />
                    <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>CSV</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="PDF"
                      checked={exportFormat === 'PDF'}
                      onChange={() => setExportFormat('PDF')}
                      className="w-4 h-4 text-[#0066cc] accent-[#0066cc] cursor-pointer"
                    />
                    <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>PDF</span>
                  </label>
                </div>
              </div>

              {/* Records Scope */}
              <div>
                <label className={`block font-bold mb-2.5 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-800'
                }`}>
                  Records
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="exportScope"
                      value="all"
                      checked={exportScope === 'all'}
                      onChange={() => setExportScope('all')}
                      className="w-4 h-4 text-[#0066cc] accent-[#0066cc] cursor-pointer"
                    />
                    <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>
                      All filtered records — <strong>2,487</strong>
                    </span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="exportScope"
                      value="violations"
                      checked={exportScope === 'violations'}
                      onChange={() => setExportScope('violations')}
                      className="w-4 h-4 text-[#0066cc] accent-[#0066cc] cursor-pointer"
                    />
                    <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>
                      Violations only — <strong>312</strong>
                    </span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="exportScope"
                      value="page"
                      checked={exportScope === 'page'}
                      onChange={() => setExportScope('page')}
                      className="w-4 h-4 text-[#0066cc] accent-[#0066cc] cursor-pointer"
                    />
                    <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>
                      Current page — <strong>10</strong>
                    </span>
                  </label>
                </div>
              </div>

              {/* Include Columns Checklist */}
              <div>
                <label className={`block font-bold mb-2.5 ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-800'
                }`}>
                  Include
                </label>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportColumns.plate}
                      onChange={(e) => setExportColumns(prev => ({ ...prev, plate: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#0066cc] accent-[#0066cc] cursor-pointer"
                    />
                    <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>Vehicle / Plate Number</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportColumns.detectedSpeed}
                      onChange={(e) => setExportColumns(prev => ({ ...prev, detectedSpeed: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#0066cc] accent-[#0066cc] cursor-pointer"
                    />
                    <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>Detected Speed</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportColumns.dateTime}
                      onChange={(e) => setExportColumns(prev => ({ ...prev, dateTime: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#0066cc] accent-[#0066cc] cursor-pointer"
                    />
                    <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>Date & Time</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportColumns.speedLimit}
                      onChange={(e) => setExportColumns(prev => ({ ...prev, speedLimit: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#0066cc] accent-[#0066cc] cursor-pointer"
                    />
                    <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>Speed Limit</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportColumns.location}
                      onChange={(e) => setExportColumns(prev => ({ ...prev, location: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#0066cc] accent-[#0066cc] cursor-pointer"
                    />
                    <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>Location</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportColumns.difference}
                      onChange={(e) => setExportColumns(prev => ({ ...prev, difference: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#0066cc] accent-[#0066cc] cursor-pointer"
                    />
                    <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>Difference</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportColumns.lane}
                      onChange={(e) => setExportColumns(prev => ({ ...prev, lane: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#0066cc] accent-[#0066cc] cursor-pointer"
                    />
                    <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>Lane</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportColumns.status}
                      onChange={(e) => setExportColumns(prev => ({ ...prev, status: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#0066cc] accent-[#0066cc] cursor-pointer"
                    />
                    <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>Violation Status</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className={`px-6 py-4 border-t flex items-center justify-end gap-3 transition-colors ${
              isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-100'
            }`}>
              <button
                onClick={() => setShowExportModal(false)}
                className={`px-5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  isDarkMode 
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800' 
                    : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>

              <button
                onClick={handleExecuteExport}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#0066cc] hover:bg-[#0055b3] text-white flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download {exportFormat}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 10. DEDICATED PDF REPORT PREVIEW MODAL */}
      {/* ------------------------------------------------------------- */}
      {showPdfPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`border rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] ${
            isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-slate-100 border-slate-300 text-slate-900'
          }`}>
            {/* Preview Modal Header */}
            <div className={`px-6 py-3.5 border-b flex items-center justify-between ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-sky-500" />
                <div>
                  <h3 className="text-sm font-bold">Speed & Violation Audit Report (PDF Document)</h3>
                  <p className="text-[11px] text-slate-400">Standard A4 Official Layout • E-Mobility TMC Sri Lanka</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                    isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>

                <button
                  onClick={handleDownloadPdfFile}
                  disabled={isExporting}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#0066cc] hover:bg-[#0055b3] text-white flex items-center gap-1.5 shadow-sm transition"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
                </button>

                <button
                  onClick={() => setShowPdfPreviewModal(false)}
                  className={`p-1.5 rounded-lg ml-2 transition ${
                    isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preview Modal Body (Scrollable A4 document container) */}
            {/* Preview Modal Body (Scrollable A4 document container) */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-500/20 flex justify-center">
              <AuditReportPdfTemplate
                id="audit-report-pdf-preview"
                reportId="RPT-2025-06-16-0001"
                reportName={reportName || 'E01 Speed Audit - 16 Jun 2025'}
                highway={selectedHighway || 'E01 Southern Expressway'}
                dateRange={dateTimeRange || '2025-06-16 00:00:00 to 2025-06-16 23:59:59'}
                generatedOn={new Date().toISOString().replace('T', ' ').substring(0, 19)}
                generatedBy="R. Senanayake (Operations Lead)"
                totalVehicles={2487}
                speedViolations={312}
                warnings={86}
                averageSpeed={82}
                records={filteredData}
              />
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 11. ALWAYS-MOUNTED CONTAINER FOR DIRECT PDF DOWNLOAD */}
      {/* ------------------------------------------------------------- */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '794px',
          background: '#ffffff',
          zIndex: -9999,
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      >
        <AuditReportPdfTemplate
          id="audit-report-pdf-root"
          reportId="RPT-2025-06-16-0001"
          reportName={reportName || 'E01 Speed Audit - 16 Jun 2025'}
          highway={selectedHighway || 'E01 Southern Expressway'}
          dateRange={dateTimeRange || '2025-06-16 00:00:00 to 2025-06-16 23:59:59'}
          generatedOn="2025-06-16 13:39:56"
          generatedBy="R. Senanayake (Operations Lead)"
          totalVehicles={2487}
          speedViolations={312}
          warnings={86}
          averageSpeed={82}
          records={filteredData}
        />
      </div>
    </div>
  );
}
