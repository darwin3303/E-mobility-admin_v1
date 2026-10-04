// import React, { useEffect, useRef, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { createPortal } from 'react-dom';

// const SidebarTooltip = ({
//   content,
//   targetRef,
//   position = 'right',
//   delay = 300,
//   onClose,
//   className = '',
// }) => {
//   const [tooltipStyle, setTooltipStyle] = useState({});
//   const [isVisible, setIsVisible] = useState(false);
//   const tooltipRef = useRef(null);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsVisible(true);
//     }, delay);

//     return () => clearTimeout(timer);
//   }, [delay]);

//   useEffect(() => {
//     if (targetRef?.current && tooltipRef.current) {
//       const targetRect = targetRef.current.getBoundingClientRect();
//       const tooltipRect = tooltipRef.current.getBoundingClientRect();

//       let x = targetRect.right + 12;
//       let y = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);

//       const viewportWidth = window.innerWidth;
//       const viewportHeight = window.innerHeight;

//       if (x + tooltipRect.width > viewportWidth) {
//         x = viewportWidth - tooltipRect.width - 16;
//       }
//       if (x < 16) {
//         x = 16;
//       }
//       if (y + tooltipRect.height > viewportHeight) {
//         y = viewportHeight - tooltipRect.height - 16;
//       }
//       if (y < 16) {
//         y = 16;
//       }

//       setTooltipStyle({
//         left: `${x}px`,
//         top: `${y}px`,
//         position: 'fixed',
//         zIndex: 1000,
//       });
//     }
//   }, [targetRef, position, isVisible]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (tooltipRef.current && !tooltipRef.current.contains(event.target) &&
//           targetRef?.current && !targetRef.current.contains(event.target)) {
//         setIsVisible(false);
//         if (onClose) onClose();
//       }
//     };

//     document.addEventListener('click', handleClickOutside);
//     return () => document.removeEventListener('click', handleClickOutside);
//   }, [onClose, targetRef]);

//   const tooltipVariants = {
//     hidden: {
//       opacity: 0,
//       scale: 0.8,
//       x: 10,
//       y: 0,
//     },
//     visible: {
//       opacity: 1,
//       scale: 1,
//       x: 0,
//       y: 0,
//       transition: {
//         type: 'spring',
//         damping: 20,
//         stiffness: 300,
//       },
//     },
//     exit: {
//       opacity: 0,
//       scale: 0.8,
//       x: 10,
//       transition: {
//         duration: 0.15,
//       },
//     },
//   };

//   return createPortal(
//     <AnimatePresence>
//       {isVisible && (
//         <motion.div
//           ref={tooltipRef}
//           className={`sidebar-tooltip ${className}`}
//           style={tooltipStyle}
//           variants={tooltipVariants}
//           initial="hidden"
//           animate="visible"
//           exit="exit"
//           role="tooltip"
//           aria-label={content}
//         >
//           <div className="sidebar-tooltip-content">
//             <span className="sidebar-tooltip-text">{content}</span>
//             <div className="sidebar-tooltip-arrow" />
//           </div>
//         </motion.div>
//       )}
//     </AnimatePresence>,
//     document.body
//   );
// };

// export default SidebarTooltip;