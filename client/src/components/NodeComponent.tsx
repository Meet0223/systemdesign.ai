import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  Server, 
  Database, 
  Brackets, 
  GaugeCircle, 
  Shield, 
  HardDrive,
  Tv,
  Monitor,
  Video,
  CircleDashed,
  Network,
  LayoutGrid,
  Cog
} from 'lucide-react';
import { NodeData } from '@/lib/types';

function NodeComponent({ data, selected }: NodeProps<NodeData>) {
  // Apply custom styles from node data with defaults that match the example
  const nodeStyle = {
    backgroundColor: data.style?.backgroundColor || '#FFFFFF',
    borderColor: data.style?.borderColor || '#CBD5E0',
    color: data.style?.textColor || '#FFFFFF',
    borderWidth: `${data.style?.borderWidth || 2}px`,
    borderRadius: `${data.style?.borderRadius || 8}px`,
    padding: `${data.style?.padding || 12}px`,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  };

  // Get the appropriate icon based on node type with defaults matching the diagram
  const getIcon = () => {
    switch (data.type) {
      case 'server':
        return <Server className="w-5 h-5 mr-2" />;
      case 'database':
        return <Database className="w-5 h-5 mr-2" />;
      case 'api':
        return <Brackets className="w-5 h-5 mr-2" />;
      case 'loadBalancer':
        return <GaugeCircle className="w-5 h-5 mr-2" />;
      case 'security':
        return <Shield className="w-5 h-5 mr-2" />;
      case 'storage':
        return <HardDrive className="w-5 h-5 mr-2" />;
      case 'frontend':
        return <Monitor className="w-5 h-5 mr-2" />;
      case 'media':
        return <Video className="w-5 h-5 mr-2" />;
      case 'cdn':
        return <Network className="w-5 h-5 mr-2" />;
      case 'processing':
        return <Cog className="w-5 h-5 mr-2" />;
      case 'player':
        return <Tv className="w-5 h-5 mr-2" />;
      default:
        return <CircleDashed className="w-5 h-5 mr-2" />;
    }
  };

  // Additional class to determine if this should use white or dark text
  const isDarkBackground = data.style?.backgroundColor && 
    ['#8B5CF6', '#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'].includes(data.style.backgroundColor);

  return (
    <div
      className={`shadow-md ${selected ? 'ring-2 ring-white' : ''}`}
      style={nodeStyle}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3"
        style={{backgroundColor: nodeStyle.borderColor || '#CBD5E0'}}
      />
      
      <div className="flex items-center mb-1">
        {getIcon()}
        <span className="font-bold text-sm">{data.label}</span>
      </div>
      
      {data.description && (
        <div className="text-xs opacity-90 mt-1">{data.description}</div>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3"
        style={{backgroundColor: nodeStyle.borderColor || '#CBD5E0'}}
      />
    </div>
  );
}

export default memo(NodeComponent);
