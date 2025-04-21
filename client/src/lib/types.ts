// Node types
export type NodeType = 
  | "server" 
  | "database" 
  | "api" 
  | "loadBalancer" 
  | "security" 
  | "storage";

export interface NodeStyle {
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  borderWidth?: number;
}

export interface NodeData {
  label: string;
  description?: string;
  type: NodeType;
  style?: NodeStyle;
}

export interface Node {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: NodeData;
}

// Edge types
export interface EdgeStyle {
  strokeColor?: string;
  strokeWidth?: number;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
  style?: EdgeStyle;
}

// Component types
export type Component = {
  type: NodeType;
  label: string;
  icon: string;
};

// Template types
export type Template = {
  id: string;
  name: string;
  icon: string;
};

// Saved diagram types
export type SavedDiagram = {
  id: number;
  name: string;
  description?: string;
  userId: number;
  nodes: Node[];
  edges: Edge[];
  createdAt: string;
  updatedAt: string;
};
