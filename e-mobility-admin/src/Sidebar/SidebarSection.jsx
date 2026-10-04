// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { ChevronDown } from 'lucide-react';
// import { useSidebar } from './SidebarContext';

// const SidebarSection = ({ 
//   title, 
//   children, 
//   isCollapsed: propIsCollapsed,
//   defaultExpanded = true,
//   className = '',
// }) => {
//   const [isExpanded, setIsExpanded] = useState(defaultExpanded);
//   const { isCollapsed: sidebarCollapsed, isHovered } = useSidebar();
  
//   const isCollapsed = propIsCollapsed !== undefined ? propIsCollapsed : sidebarCollapsed;
//   const showLabels = !isCollapsed || isHovered;

//   const toggleSection = () => {
//     if (showLabels) {
//       setIsExpanded(!isExpanded);
//     }
//   };

//   const sectionVariants = {
//     collapsed: {
//       marginBottom: 8,
//     },
//     expanded: {
//       marginBottom: 16,
//     },
//   };

//   const childrenVariants = {
//     hidden: { opacity: 0, height: 0 },
//     visible: { 
//       opacity: 1, 
//       height: 'auto',
//       transition: { 
//         staggerChildren: 0.05,
//         duration: 0.3,
//       }
//     },
//     exit: { 
//       opacity: 0, 
//       height: 0,
//       transition: { duration: 0.2 }
//     },
//   };

//   const childVariants = {
//     hidden: { opacity: 0, x: -10 },
//     visible: { opacity: 1, x: 0 },
//   };

//   return (
//     <motion.div
//       className={`sidebar-section ${className}`}
//       variants={sectionVariants}
//       animate={isCollapsed && !isHovered ? 'collapsed' : 'expanded'}
//       transition={{ duration: 0.2 }}
//     >
//       <motion.button
//         className="sidebar-section-header"
//         onClick={toggleSection}
//         whileHover={{ opacity: 0.8 }}
//         whileTap={{ scale: 0.98 }}
//       >
//         {showLabels ? (
//           <>
//             <span className="sidebar-section-title">{title}</span>
//             <motion.span
//               className="sidebar-section-arrow"
//               animate={{ rotate: isExpanded ? 180 : 0 }}
//               transition={{ duration: 0.2 }}
//             >
//               <ChevronDown size={14} />
//             </motion.span>
//           </>
//         ) : (
//           <div className="sidebar-section-divider" />
//         )}
//       </motion.button>

//       <AnimatePresence initial={false}>
//         {(!isCollapsed || isHovered) && isExpanded && (
//           <motion.div
//             className="sidebar-section-content"
//             variants={childrenVariants}
//             initial="hidden"
//             animate="visible"
//             exit="exit"
//           >
//             {React.Children.map(children, (child) => (
//               <motion.div variants={childVariants}>
//                 {child}
//               </motion.div>
//             ))}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// };

// export default SidebarSection;