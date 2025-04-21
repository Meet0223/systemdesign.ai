import React, { useState } from 'react';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import MainWorkspace from '@/components/MainWorkspace';
import { ReactFlowProvider } from 'reactflow';

export default function Home() {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

  const toggleLeftSidebar = () => {
    setLeftSidebarCollapsed(!leftSidebarCollapsed);
  };

  const toggleRightSidebar = () => {
    setRightSidebarCollapsed(!rightSidebarCollapsed);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans">
      {/* Left Sidebar */}
      <LeftSidebar 
        collapsed={leftSidebarCollapsed}
        toggleCollapsed={toggleLeftSidebar}
      />

      {/* Main Workspace */}
      <ReactFlowProvider>
        <MainWorkspace 
          leftSidebarCollapsed={leftSidebarCollapsed}
          rightSidebarCollapsed={rightSidebarCollapsed}
        />
      </ReactFlowProvider>

      {/* Right Sidebar */}
      <RightSidebar 
        collapsed={rightSidebarCollapsed}
        toggleCollapsed={toggleRightSidebar}
      />
    </div>
  );
}
