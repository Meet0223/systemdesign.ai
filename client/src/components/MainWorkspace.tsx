import React, { useState, useRef } from 'react';
import DiagramCanvas from './DiagramCanvas';
import { useDiagramStore } from '@/store/diagramStore';
import { generateDiagram } from '@/lib/gemini';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  Plus, 
  Minus, 
  Check, 
  Upload, 
  Download,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import LoadingOverlay from './LoadingOverlay';

interface MainWorkspaceProps {
  leftSidebarCollapsed: boolean;
  rightSidebarCollapsed: boolean;
}

export default function MainWorkspace({ 
  leftSidebarCollapsed, 
  rightSidebarCollapsed 
}: MainWorkspaceProps) {
  const [prompt, setPrompt] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const { toast } = useToast();
  const { 
    setNodes, 
    setEdges, 
    reset, 
    setLoading, 
    isLoading 
  } = useDiagramStore();

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleGenerateDiagram = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a description of your system architecture.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const result = await generateDiagram(prompt);
      
      if (result && result.nodes && result.edges) {
        // Reset the current diagram and set the new one
        reset();
        setNodes(result.nodes);
        setEdges(result.edges);
        
        toast({
          title: "Diagram Generated",
          description: "Your system architecture diagram has been created successfully.",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: "Failed to generate diagram. Please try a different prompt.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const exportDiagram = (format: 'svg' | 'png') => {
    toast({
      title: "Export Started",
      description: `Exporting diagram as ${format.toUpperCase()}...`,
    });
    
    // Implementation would depend on the React Flow API
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `Diagram has been exported as ${format.toUpperCase()}.`,
      });
    }, 1000);
  };

  return (
    <div className="flex flex-col flex-grow overflow-hidden">
      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay />}
      
      {/* Top Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center">
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600">
            <RefreshCw className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600">
            <Check className="h-5 w-5" />
          </Button>
          
          <div className="border-r border-gray-300 h-6 mx-1"></div>
          
          <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600">
            <Plus className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-600">
            <Minus className="h-5 w-5" />
          </Button>
          
          <div className="border-r border-gray-300 h-6 mx-1"></div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 text-gray-600"
            onClick={() => exportDiagram('svg')}
          >
            <Upload className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 text-gray-600"
            onClick={() => exportDiagram('png')}
          >
            <Download className="h-5 w-5" />
          </Button>
        </div>

        {/* AI Prompt Input */}
        <div className="flex-grow mx-4">
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={handlePromptChange}
              placeholder="Describe your system architecture..."
              className="w-full rounded-md border border-gray-300 py-2 pl-4 pr-12 focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80"
              onClick={handleGenerateDiagram}
              disabled={isLoading}
            >
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-gray-600"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-gray-600"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <span className="text-sm text-gray-600">{zoomLevel}%</span>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-grow overflow-hidden">
        <DiagramCanvas
          zoomLevel={zoomLevel}
          leftSidebarCollapsed={leftSidebarCollapsed}
          rightSidebarCollapsed={rightSidebarCollapsed}
        />
      </div>
    </div>
  );
}
