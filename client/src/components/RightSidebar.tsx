import React, { useState, useEffect } from 'react';
import { useDiagramStore } from '@/store/diagramStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash, X, Check } from 'lucide-react';
import { NodeType } from '@/lib/types';

interface RightSidebarProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

export default function RightSidebar({ collapsed, toggleCollapsed }: RightSidebarProps) {
  const { 
    selectedNode, 
    selectedEdge, 
    updateNode, 
    updateEdge, 
    removeNode, 
    removeEdge,
    nodes
  } = useDiagramStore();

  // State for the node form
  const [nodeForm, setNodeForm] = useState({
    label: '',
    type: '',
    description: '',
    posX: 0,
    posY: 0,
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E0',
    textColor: '#1A202C',
    borderWidth: 1,
  });

  // State for the edge form
  const [edgeForm, setEdgeForm] = useState({
    label: '',
    strokeColor: '#CBD5E0',
    strokeWidth: 2,
  });

  // Update form when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setNodeForm({
        label: selectedNode.data.label || '',
        type: selectedNode.data.type || '',
        description: selectedNode.data.description || '',
        posX: selectedNode.position.x,
        posY: selectedNode.position.y,
        backgroundColor: selectedNode.data.style?.backgroundColor || '#FFFFFF',
        borderColor: selectedNode.data.style?.borderColor || '#CBD5E0',
        textColor: selectedNode.data.style?.textColor || '#1A202C',
        borderWidth: selectedNode.data.style?.borderWidth || 1,
      });
    }
  }, [selectedNode]);

  // Update form when selected edge changes
  useEffect(() => {
    if (selectedEdge) {
      setEdgeForm({
        label: selectedEdge.label || '',
        strokeColor: selectedEdge.style?.strokeColor || '#CBD5E0',
        strokeWidth: selectedEdge.style?.strokeWidth || 2,
      });
    }
  }, [selectedEdge]);

  // Handle node form changes
  const handleNodeFormChange = (field: string, value: any) => {
    setNodeForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle edge form changes
  const handleEdgeFormChange = (field: string, value: any) => {
    setEdgeForm(prev => ({ ...prev, [field]: value }));
  };

  // Apply node changes
  const applyNodeChanges = () => {
    if (!selectedNode) return;
    
    updateNode(selectedNode.id, {
      position: { x: nodeForm.posX, y: nodeForm.posY },
      data: {
        ...selectedNode.data,
        label: nodeForm.label,
        type: nodeForm.type as NodeType,
        description: nodeForm.description,
        style: {
          backgroundColor: nodeForm.backgroundColor,
          borderColor: nodeForm.borderColor,
          textColor: nodeForm.textColor,
          borderWidth: nodeForm.borderWidth,
        },
      },
    });
  };

  // Apply edge changes
  const applyEdgeChanges = () => {
    if (!selectedEdge) return;
    
    updateEdge(selectedEdge.id, {
      label: edgeForm.label,
      style: {
        strokeColor: edgeForm.strokeColor,
        strokeWidth: edgeForm.strokeWidth,
      },
    });
  };

  // Delete selected node
  const handleDeleteNode = () => {
    if (selectedNode) {
      removeNode(selectedNode.id);
    }
  };

  // Delete selected edge
  const handleDeleteEdge = () => {
    if (selectedEdge) {
      removeEdge(selectedEdge.id);
    }
  };

  // Get connections for the selected node
  const getNodeConnections = () => {
    if (!selectedNode) return [];
    
    return nodes
      .filter(node => node.id !== selectedNode.id)
      .map(node => ({
        id: node.id,
        label: node.data.label,
      }));
  };

  if (collapsed) {
    return (
      <div className="w-0 bg-white border-l border-gray-200 h-full overflow-hidden transition-all duration-300 ease-in-out">
        <button 
          onClick={toggleCollapsed}
          className="absolute right-4 top-4 p-1 rounded-full sidebar-toggle bg-white border border-gray-200 shadow-md"
        >
          <svg className="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-72 bg-white border-l border-gray-200 h-full flex flex-col transition-all duration-300 ease-in-out">
      {/* Header with title and close button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="font-ibm font-semibold text-textColor">Properties</h2>
        <button 
          onClick={toggleCollapsed}
          className="p-1 rounded-full sidebar-toggle"
        >
          <svg className="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {selectedNode ? (
        <>
          {/* Node Property Editor */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Selected Component</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-destructive" 
                onClick={handleDeleteNode}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4 custom-scrollbar">
              <div>
                <Label htmlFor="componentName" className="text-sm font-medium text-gray-700">Name</Label>
                <Input 
                  id="componentName" 
                  value={nodeForm.label} 
                  onChange={(e) => handleNodeFormChange('label', e.target.value)} 
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="componentType" className="text-sm font-medium text-gray-700">Type</Label>
                <Select
                  value={nodeForm.type}
                  onValueChange={(value) => handleNodeFormChange('type', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="server">Server</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="api">API Service</SelectItem>
                    <SelectItem value="loadBalancer">Load Balancer</SelectItem>
                    <SelectItem value="security">Security Layer</SelectItem>
                    <SelectItem value="storage">Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="componentDescription" className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea 
                  id="componentDescription" 
                  rows={3} 
                  value={nodeForm.description} 
                  onChange={(e) => handleNodeFormChange('description', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Position</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <Label htmlFor="posX" className="text-xs text-gray-500">X</Label>
                    <Input 
                      id="posX" 
                      type="number" 
                      value={nodeForm.posX} 
                      onChange={(e) => handleNodeFormChange('posX', parseInt(e.target.value))} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="posY" className="text-xs text-gray-500">Y</Label>
                    <Input 
                      id="posY" 
                      type="number" 
                      value={nodeForm.posY} 
                      onChange={(e) => handleNodeFormChange('posY', parseInt(e.target.value))} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Styling Options */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Style</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fillColor" className="text-sm font-medium text-gray-700">Fill Color</Label>
                <div className="flex mt-1">
                  <Input 
                    type="color" 
                    id="fillColor" 
                    value={nodeForm.backgroundColor} 
                    onChange={(e) => handleNodeFormChange('backgroundColor', e.target.value)} 
                    className="w-10 h-10 p-0 border border-gray-300 rounded-md mr-2" 
                  />
                  <Input 
                    type="text" 
                    value={nodeForm.backgroundColor} 
                    onChange={(e) => handleNodeFormChange('backgroundColor', e.target.value)} 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="borderColor" className="text-sm font-medium text-gray-700">Border Color</Label>
                <div className="flex mt-1">
                  <Input 
                    type="color" 
                    id="borderColor" 
                    value={nodeForm.borderColor} 
                    onChange={(e) => handleNodeFormChange('borderColor', e.target.value)} 
                    className="w-10 h-10 p-0 border border-gray-300 rounded-md mr-2" 
                  />
                  <Input 
                    type="text" 
                    value={nodeForm.borderColor} 
                    onChange={(e) => handleNodeFormChange('borderColor', e.target.value)} 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="textColor" className="text-sm font-medium text-gray-700">Text Color</Label>
                <div className="flex mt-1">
                  <Input 
                    type="color" 
                    id="textColor" 
                    value={nodeForm.textColor} 
                    onChange={(e) => handleNodeFormChange('textColor', e.target.value)} 
                    className="w-10 h-10 p-0 border border-gray-300 rounded-md mr-2" 
                  />
                  <Input 
                    type="text" 
                    value={nodeForm.textColor} 
                    onChange={(e) => handleNodeFormChange('textColor', e.target.value)} 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="borderWidth" className="text-sm font-medium text-gray-700">Border Width</Label>
                <Input 
                  type="range" 
                  id="borderWidth" 
                  min="0" 
                  max="5" 
                  value={nodeForm.borderWidth} 
                  onChange={(e) => handleNodeFormChange('borderWidth', parseInt(e.target.value))} 
                  className="w-full mt-1" 
                />
                <div className="text-sm text-center mt-1">{nodeForm.borderWidth}px</div>
              </div>
            </div>
          </div>

          {/* Connection Settings */}
          <div className="p-4 flex-grow overflow-auto custom-scrollbar">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Connections</h3>
            <div className="space-y-2">
              {getNodeConnections().slice(0, 2).map(connection => (
                <div key={connection.id} className="p-2 bg-background rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{connection.label}</span>
                    <button className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">Read/Write</div>
                </div>
              ))}
              <button className="w-full mt-2 py-1 px-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 flex items-center justify-center">
                <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add connection
              </button>
            </div>
          </div>

          {/* Footer actions */}
          <div className="p-4 border-t border-gray-200">
            <Button 
              className="w-full bg-primary text-white flex items-center justify-center" 
              onClick={applyNodeChanges}
            >
              <Check className="w-4 h-4 mr-2" />
              Apply Changes
            </Button>
          </div>
        </>
      ) : selectedEdge ? (
        <>
          {/* Edge Property Editor */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Selected Connection</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-destructive" 
                onClick={handleDeleteEdge}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4 custom-scrollbar">
              <div>
                <Label htmlFor="edgeLabel" className="text-sm font-medium text-gray-700">Label</Label>
                <Input 
                  id="edgeLabel" 
                  value={edgeForm.label} 
                  onChange={(e) => handleEdgeFormChange('label', e.target.value)} 
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="strokeColor" className="text-sm font-medium text-gray-700">Color</Label>
                <div className="flex mt-1">
                  <Input 
                    type="color" 
                    id="strokeColor" 
                    value={edgeForm.strokeColor} 
                    onChange={(e) => handleEdgeFormChange('strokeColor', e.target.value)} 
                    className="w-10 h-10 p-0 border border-gray-300 rounded-md mr-2" 
                  />
                  <Input 
                    type="text" 
                    value={edgeForm.strokeColor} 
                    onChange={(e) => handleEdgeFormChange('strokeColor', e.target.value)} 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="strokeWidth" className="text-sm font-medium text-gray-700">Width</Label>
                <Input 
                  type="range" 
                  id="strokeWidth" 
                  min="1" 
                  max="5" 
                  value={edgeForm.strokeWidth} 
                  onChange={(e) => handleEdgeFormChange('strokeWidth', parseInt(e.target.value))} 
                  className="w-full mt-1" 
                />
                <div className="text-sm text-center mt-1">{edgeForm.strokeWidth}px</div>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="p-4 border-t border-gray-200 mt-auto">
            <Button 
              className="w-full bg-primary text-white flex items-center justify-center" 
              onClick={applyEdgeChanges}
            >
              <Check className="w-4 h-4 mr-2" />
              Apply Changes
            </Button>
          </div>
        </>
      ) : (
        <div className="p-4 flex items-center justify-center flex-grow text-gray-500">
          Select a node or edge to edit its properties
        </div>
      )}
    </div>
  );
}
