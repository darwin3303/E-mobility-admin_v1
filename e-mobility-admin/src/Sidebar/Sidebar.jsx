// import React from 'react';
// import { 
//   LayoutDashboard, 
//   Video, 
//   Cpu, 
//   FileText, 
//   Settings, 
//   Bell, 
//   ShieldCheck,
//   ChevronLeft,
//   ChevronRight
// } from 'lucide-react';

// const Sidebar = ({ 
//   initialCollapsed = false,
//   onToggle,
//   defaultActiveItem = 'Dashboard',
//   isDarkMode = true,
//   currentMenu,
//   setCurrentMenu,
//   displayRegistryCount = 0,
//   notifications = [],
//   showNotifications = false,
//   setShowNotifications,
//   markNotificationAsRead,
//   clearNotifications
// }) => {
//   const [collapsed, setCollapsed] = React.useState(initialCollapsed);

//   const handleToggle = () => {
//     const newState = !collapsed;
//     setCollapsed(newState);
//     if (onToggle) onToggle(newState);
//   };

//   const menuItems = [
//     { name: 'Dashboard', icon: LayoutDashboard, badge: null, tag: null },
//     { name: 'Live Violations', icon: Video, badge: '7K', tag: null },
//     { name: 'AI Diagnostics', icon: Cpu, badge: null, tag: 'MODEL' },
//     { name: 'Reports', icon: FileText, badge: null, tag: null },
//   ];

//   return (
//     <aside className={`${collapsed ? 'w-20' : 'w-64'} ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-r flex flex-col select-none transition-all duration-300 h-screen sticky top-0 relative`}>
//       <div className="flex-1 overflow-y-auto">
//         <div className={`p-5 flex ${collapsed ? 'justify-center' : 'items-center space-x-3'} border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
//           <div className="bg-blue-600 p-2 rounded-xl text-white flex items-center justify-center shadow-lg shadow-blue-500/30 min-w-[40px]">
//             <ShieldCheck size={20} />
//           </div>
//           {!collapsed && (
//             <div className="overflow-hidden">
//               <h1 className="text-xs font-bold uppercase tracking-wider text-slate-400 truncate">e-Mobility Sri Lanka</h1>
//               <p className="text-sm font-bold text-slate-100 truncate">Vehicle Portal</p>
//             </div>
//           )}
//         </div>

//         <div className="px-4 py-6">
//           {!collapsed && (
//             <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase px-3 mb-3">Operations</p>
//           )}
//           <nav className="space-y-1">
//             {menuItems.map((item) => {
//               const Icon = item.icon;
//               const isActive = currentMenu === item.name;
//               return (
//                 <button
//                   key={item.name}
//                   onClick={() => setCurrentMenu(item.name)}
//                   className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl text-sm transition-colors ${
//                     isActive 
//                       ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-600/20' 
//                       : isDarkMode ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
//                   }`}
//                 >
//                   <div className={`flex items-center ${collapsed ? '' : 'space-x-3'}`}>
//                     <Icon size={18} className="min-w-[18px]" />
//                     {!collapsed && <span>{item.name}</span>}
//                   </div>
//                   {!collapsed && item.badge && <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full font-bold">{item.badge}</span>}
//                   {!collapsed && item.tag && <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">{item.tag}</span>}
//                 </button>
//               );
//             })}
//           </nav>

//           {!collapsed && (
//             <>
//               <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase px-3 mt-8 mb-3">System</p>
//               <nav className="space-y-1">
//                 <button 
//                   onClick={() => setCurrentMenu('Settings')}
//                   className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
//                     currentMenu === 'Settings' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-medium' : isDarkMode ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
//                   }`}
//                 >
//                   <Settings size={18} />
//                   <span>Settings</span>
//                 </button>
//               </nav>
//             </>
//           )}
//         </div>
//       </div>

//       <div className={`p-4 border-t ${isDarkMode ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-200 bg-slate-50/40'} flex ${collapsed ? 'justify-center' : 'items-center space-x-3'}`}>
//         {!collapsed ? (
//           <>
//             <div className={`w-9 h-9 rounded-full ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300'} border flex items-center justify-center font-bold text-sm text-blue-400 min-w-[36px]`}>
//               RS
//             </div>
//             <div className="overflow-hidden flex-1">
//               <p className="text-sm font-semibold text-slate-200 truncate">R. Senanayake</p>
//               <div className="flex items-center space-x-1.5">
//                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
//                 <p className="text-xs text-slate-400 truncate">{displayRegistryCount.toLocaleString()} Records Active</p>
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-blue-400 min-w-[36px]">
//             RS
//           </div>
//         )}
//       </div>

//       {/* Collapse Toggle Button */}
//       <button
//         onClick={handleToggle}
//         className={`absolute -right-3 top-20 w-6 h-6 rounded-full ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border shadow-md flex items-center justify-center hover:scale-110 transition-transform z-10`}
//       >
//         {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
//       </button>
//     </aside>
//   );
// };

// export default Sidebar;