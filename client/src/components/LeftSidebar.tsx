import React, { useState } from 'react';
import { useDiagramStore } from '@/store/diagramStore';
import { NodeType, Component, Template, SavedDiagram } from '@/lib/types';
import { 
  Server, 
  Database, 
  Brackets, 
  GaugeCircle, 
  Shield, 
  HardDrive,
  LayoutDashboard,
  Weight,
  ServerCrash
} from 'lucide-react';

interface LeftSidebarProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

// Component library data
const components: Component[] = [
  { type: 'server', label: 'Server', icon: 'Server' },
  { type: 'database', label: 'Database', icon: 'Database' },
  { type: 'api', label: 'API Service', icon: 'Brackets' },
  { type: 'loadBalancer', label: 'Load Balancer', icon: 'GaugeCircle' },
  { type: 'security', label: 'Security Layer', icon: 'Shield' },
  { type: 'storage', label: 'Storage', icon: 'HardDrive' },
];

// Template data
const templates: Template[] = [
  { id: 'microservices', name: 'Microservices Architecture', icon: 'Weight' },
  { id: 'three-tier', name: 'Three-Tier Web App', icon: 'LayoutDashboard' },
  { id: 'serverless', name: 'Serverless Architecture', icon: 'ServerCrash' },
];

// Mock saved diagrams
const savedDiagrams: Pick<SavedDiagram, 'id' | 'name' | 'updatedAt'>[] = [
  { id: 1, name: 'E-commerce Platform', updatedAt: '2 days ago' },
  { id: 2, name: 'IoT Data Pipeline', updatedAt: '1 week ago' },
  { id: 3, name: 'CI/CD Pipeline', updatedAt: '2 weeks ago' },
];

export default function LeftSidebar({ collapsed, toggleCollapsed }: LeftSidebarProps) {
  const { addNode } = useDiagramStore();

  // Handle component drag start
  const handleDragStart = (event: React.DragEvent, type: NodeType) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Get icon component based on icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Server': return <Server className="w-5 h-5" />;
      case 'Database': return <Database className="w-5 h-5" />;
      case 'Brackets': return <Brackets className="w-5 h-5" />;
      case 'GaugeCircle': return <GaugeCircle className="w-5 h-5" />;
      case 'Shield': return <Shield className="w-5 h-5" />;
      case 'HardDrive': return <HardDrive className="w-5 h-5" />;
      case 'Weight': return <Weight className="w-5 h-5" />;
      case 'LayoutDashboard': return <LayoutDashboard className="w-5 h-5" />;
      case 'ServerCrash': return <ServerCrash className="w-5 h-5" />;
      default: return <Server className="w-5 h-5" />;
    }
  };

  return (
    <div className={`bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Header with Logo */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <div className="flex items-center">
          <LayoutDashboard className="w-6 h-6 mr-2 text-primary" />
          {!collapsed && <h1 className="font-ibm font-semibold text-lg text-primary">DiagramAI</h1>}
        </div>
        <button 
          onClick={toggleCollapsed}
          className="ml-auto p-1 rounded-full sidebar-toggle"
        >
          <svg className="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Component Library Section */}
      <div className="p-4 border-b border-gray-200">
        {!collapsed && <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Component Library</h2>}
        <div className="space-y-1">
          {components.map((component) => (
            <div
              key={component.type}
              className="flex items-center p-2 rounded-md hover:bg-background cursor-grab"
              draggable
              onDragStart={(e) => handleDragStart(e, component.type)}
            >
              <span className="text-primary mr-2">
                {getIconComponent(component.icon)}
              </span>
              {!collapsed && <span>{component.label}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Templates Section */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Templates</h2>
          <div className="space-y-2">
            {templates.map((template) => (
              <button
                key={template.id}
                className="w-full flex items-center p-2 rounded-md hover:bg-background text-left"
              >
                <span className="bg-primary/10 text-primary rounded-md p-1 mr-2">
                  {getIconComponent(template.icon)}
                </span>
                <span>{template.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Saved Diagrams */}
      {!collapsed && (
        <div className="p-4 overflow-auto flex-grow custom-scrollbar">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Saved Diagrams</h2>
          <div className="space-y-2">
            {savedDiagrams.map((diagram) => (
              <div key={diagram.id} className="p-2 rounded-md hover:bg-background">
                <div className="font-medium text-sm">{diagram.name}</div>
                <div className="text-xs text-gray-500">Modified {diagram.updatedAt}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
