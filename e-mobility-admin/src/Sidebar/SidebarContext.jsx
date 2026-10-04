// import React, { createContext, useContext } from 'react';

// const SidebarContext = createContext();

// export const SidebarProvider = ({ children, value }) => {
//   return (
//     <SidebarContext.Provider value={value}>
//       {children}
//     </SidebarContext.Provider>
//   );
// };

// export const useSidebar = () => {
//   const context = useContext(SidebarContext);
//   if (!context) {
//     throw new Error('useSidebar must be used within a SidebarProvider');
//   }
//   return context;
// };

// export default SidebarContext;