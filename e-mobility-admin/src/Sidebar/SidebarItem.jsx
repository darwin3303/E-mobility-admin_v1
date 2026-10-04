// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { useSidebar } from './SidebarContext';
// import SidebarTooltip from './SidebarTooltip';

// const SidebarItem = ({
//   icon: Icon,
//   label,
//   isActive = false,
//   onClick,
//   badge,
//   tag,
//   className = '',
// }) => {
//   const [isHovered, setIsHovered] = useState(false);
//   const [showTooltip, setShowTooltip] = useState(false);
//   const itemRef = React.useRef(null);
//   const { isCollapsed, isHovered: sidebarHovered, setHoveredItem, showTooltips, tooltipDelay, isDarkMode } = useSidebar();

//   const handleMouseEnter = () => {
//     setIsHovered(true);
//     setHoveredItem(label);
//     if (isCollapsed && !sidebarHovered && showTooltips) {
//       setTimeout(() => setShowTooltip(true), tooltipDelay);
//     }
//   };

//   const handleMouseLeave = () => {
//     setIsHovered(false);
//     setHoveredItem(null);
//     setShowTooltip(false);
//   };

//   const handleClick = (e) => {
//     if (onClick) onClick(e);
//   };

//   const itemVariants = {
//     collapsed: {
//       justifyContent: 'center',
//       padding: '12px',
//     },
//     expanded: {
//       justifyContent: 'space-between',
//       padding: '10px 16px',
//     },
//   };

//   const iconVariants = {
//     initial: { scale: 1 },
//     hover: { scale: 1.1, rotate: [0, -5, 5, 0] },
//   };

//   return (
//     <>
//       <div
//         ref={itemRef}
//         className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''} ${className}`}
//         onMouseEnter={handleMouseEnter}
//         onMouseLeave={handleMouseLeave}
//         onClick={handleClick}
//         role="button"
//         tabIndex={0}
//         aria-current={isActive ? 'page' : undefined}
//       >
//         <motion.div
//           className="sidebar-item-content"
//           initial="expanded"
//           animate={isCollapsed && !sidebarHovered ? 'collapsed' : 'expanded'}
//           variants={itemVariants}
//           transition={{ duration: 0.2 }}
//         >
//           <div className="sidebar-item-left">
//             <motion.div
//               className="sidebar-item-icon"
//               variants={iconVariants}
//               initial="initial"
//               whileHover="hover"
//               transition={{ duration: 0.2 }}
//             >
//               <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
//             </motion.div>

//             {(!isCollapsed || sidebarHovered) && (
//               <motion.span
//                 className="sidebar-item-label"
//                 initial={{ opacity: 0, width: 0 }}
//                 animate={{ opacity: 1, width: 'auto' }}
//                 exit={{ opacity: 0, width: 0 }}
//                 transition={{ duration: 0.2 }}
//               >
//                 {label}
//               </motion.span>
//             )}
//           </div>

//           {(!isCollapsed || sidebarHovered) && (
//             <div className="sidebar-item-right">
//               {badge && (
//                 <span className="sidebar-item-badge">
//                   {badge}
//                 </span>
//               )}
//               {tag && (
//                 <span className="sidebar-item-tag">
//                   {tag}
//                 </span>
//               )}
//             </div>
//           )}
//         </motion.div>

//         {isActive && (
//           <motion.div
//             className="sidebar-item-indicator"
//             layoutId="activeIndicator"
//             transition={{ duration: 0.3 }}
//           />
//         )}
//       </div>

//       {showTooltip && (
//         <SidebarTooltip
//           content={label}
//           targetRef={itemRef}
//           position="right"
//           delay={tooltipDelay}
//           onClose={() => setShowTooltip(false)}
//         />
//       )}
//     </>
//   );
// };

// export default SidebarItem;