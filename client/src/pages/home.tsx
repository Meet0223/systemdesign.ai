import React, { useState } from 'react';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import MainWorkspace from '@/components/MainWorkspace';
import { ReactFlowProvider } from 'reactflow';
import Layout from '@/components/Layout';
import { useAuth } from '@/lib/auth';

export default function Home() {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const { user } = useAuth();

  const toggleLeftSidebar = () => {
    setLeftSidebarCollapsed(!leftSidebarCollapsed);
  };

  const toggleRightSidebar = () => {
    setRightSidebarCollapsed(!rightSidebarCollapsed);
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem)] w-screen overflow-hidden font-sans">
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
    </Layout>
  );
}
