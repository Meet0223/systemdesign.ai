import { create } from 'zustand';
import { Node, Edge, NodeType } from '@/lib/types';
import { nanoid } from 'nanoid';

interface DiagramState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  isLoading: boolean;
  
  // Actions
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (type: NodeType, position: { x: number, y: number }, label: string) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  removeNode: (id: string) => void;
  
  addEdge: (source: string, target: string, label?: string) => void;
  updateEdge: (id: string, updates: Partial<Edge>) => void;
  removeEdge: (id: string) => void;
  
  selectNode: (node: Node | null) => void;
  selectEdge: (edge: Edge | null) => void;
  
  setLoading: (isLoading: boolean) => void;
  
  reset: () => void;
}

const initialState = {
  nodes: [],
  edges: [],
  selectedNode: null,
  selectedEdge: null,
  isLoading: false,
};

export const useDiagramStore = create<DiagramState>((set, get) => ({
  ...initialState,
  
  setNodes: (nodes: Node[]) => set({ nodes }),
  
  setEdges: (edges: Edge[]) => set({ edges }),
  
  addNode: (type: NodeType, position: { x: number, y: number }, label: string) => {
    const newNode: Node = {
      id: nanoid(),
      type: 'default',
      position,
      data: {
        label,
        type,
        description: '',
        style: {
          backgroundColor: '#FFFFFF',
          borderColor: '#CBD5E0',
          textColor: '#1A202C',
          borderWidth: 1,
        },
      },
    };
    
    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));
    
    return newNode;
  },
  
  updateNode: (id: string, updates: Partial<Node>) => {
    set((state) => ({
      nodes: state.nodes.map((node) => 
        node.id === id 
          ? { 
              ...node, 
              ...updates,
              // Handle nested data updates
              data: updates.data ? { ...node.data, ...updates.data } : node.data
            } 
          : node
      ),
      // Update selectedNode if it's the one being updated
      selectedNode: state.selectedNode?.id === id 
        ? { ...state.selectedNode, ...updates } as Node 
        : state.selectedNode
    }));
  },
  
  removeNode: (id: string) => {
    // Also remove any connected edges
    const connectedEdgeIds = get().edges
      .filter((edge) => edge.source === id || edge.target === id)
      .map((edge) => edge.id);
    
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) => !connectedEdgeIds.includes(edge.id)),
      selectedNode: state.selectedNode?.id === id ? null : state.selectedNode,
    }));
  },
  
  addEdge: (source: string, target: string, label = '') => {
    const newEdge: Edge = {
      id: nanoid(),
      source,
      target,
      label,
      style: {
        strokeColor: '#CBD5E0',
        strokeWidth: 2,
      },
    };
    
    set((state) => ({
      edges: [...state.edges, newEdge],
    }));
    
    return newEdge;
  },
  
  updateEdge: (id: string, updates: Partial<Edge>) => {
    set((state) => ({
      edges: state.edges.map((edge) => 
        edge.id === id 
          ? { ...edge, ...updates } 
          : edge
      ),
      // Update selectedEdge if it's the one being updated
      selectedEdge: state.selectedEdge?.id === id 
        ? { ...state.selectedEdge, ...updates } as Edge 
        : state.selectedEdge
    }));
  },
  
  removeEdge: (id: string) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
      selectedEdge: state.selectedEdge?.id === id ? null : state.selectedEdge,
    }));
  },
  
  selectNode: (node: Node | null) => {
    set({ 
      selectedNode: node,
      selectedEdge: null, // Deselect edge when selecting a node
    });
  },
  
  selectEdge: (edge: Edge | null) => {
    set({ 
      selectedEdge: edge,
      selectedNode: null, // Deselect node when selecting an edge
    });
  },
  
  setLoading: (isLoading: boolean) => set({ isLoading }),
  
  reset: () => set(initialState),
}));
