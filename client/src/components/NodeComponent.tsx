import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  Server, 
  Database, 
  Brackets, 
  GaugeCircle, 
  Shield, 
  HardDrive 
} from 'lucide-react';
import { NodeData } from '@/lib/types';

function NodeComponent({ data, selected }: NodeProps<NodeData>) {
  // Apply custom styles from node data
  const nodeStyle = {
    backgroundColor: data.style?.backgroundColor || '#FFFFFF',
    borderColor: data.style?.borderColor || '#CBD5E0',
    color: data.style?.textColor || '#1A202C',
    borderWidth: `${data.style?.borderWidth || 1}px`,
  };

  // Get the appropriate icon based on node type
  const getIcon = () => {
    switch (data.type) {
      case 'server':
        return <Server className="w-5 h-5 text-primary mr-2" />;
      case 'database':
        return <Database className="w-5 h-5 text-primary mr-2" />;
      case 'api':
        return <Brackets className="w-5 h-5 text-primary mr-2" />;
      case 'loadBalancer':
        return <GaugeCircle className="w-5 h-5 text-primary mr-2" />;
      case 'security':
        return <Shield className="w-5 h-5 text-primary mr-2" />;
      case 'storage':
        return <HardDrive className="w-5 h-5 text-primary mr-2" />;
      default:
        return <Server className="w-5 h-5 text-primary mr-2" />;
    }
  };

  return (
    <div
      className={`p-3 shadow-md rounded-md bg-white ${selected ? 'ring-2 ring-primary' : ''}`}
      style={nodeStyle}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-primary"
      />
      
      <div className="flex items-center mb-2">
        {getIcon()}
        <span className="font-medium text-sm">{data.label}</span>
      </div>
      
      {data.description && (
        <div className="text-xs text-gray-500">{data.description}</div>
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-primary"
      />
    </div>
  );
}

export default memo(NodeComponent);
