import { Node, Edge } from '@/lib/types';
import { layoutDiagram } from './layoutEngine';

interface GenerateDiagramRequest {
  prompt: string;
}

interface GenerateDiagramResponse {
  nodes: Node[];
  edges: Edge[];
}

// Generate diagram using Gemini API through server
export async function generateDiagram(prompt: string): Promise<GenerateDiagramResponse> {
  try {
    console.log("Starting Gemini generation with prompt:", prompt);
    
    // Use the server endpoint instead of direct API call
    const response = await fetch('/api/generate-diagram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });
    
    console.log("Received response from server:", response.status);
    
    if (!response.ok) {
      // Get the error details from response
      const errorData = await response.json();
      console.error("Error response from server:", errorData);
      throw new Error(errorData.message || 'Failed to generate diagram');
    }
    
    const data = await response.json();
    console.log("Parsed response data with", data.nodes?.length || 0, "nodes and", data.edges?.length || 0, "edges");
    
    if (!data.nodes || !data.edges) {
      console.error("Invalid response format:", data);
      throw new Error("Invalid response format: missing nodes or edges");
    }
    
    // Apply automatic layout to position nodes
    console.log("Applying automatic layout to nodes...");
    const layoutOptions = {
      direction: 'TB' as 'TB',
      nodeSeparation: 100,
      rankSeparation: 150,
      padding: 50
    };
    
    const positionedNodes = layoutDiagram(data.nodes, data.edges, layoutOptions);
    console.log("Layout engine applied, nodes positioned");
    
    return {
      nodes: positionedNodes,
      edges: data.edges
    };
  } catch (error) {
    console.error('Error generating diagram with Gemini:', error);
    // Improve error message with more details
    if (error instanceof Error) {
      throw new Error(`Error generating diagram with Gemini: ${error.message}`);
    } else {
      throw new Error(`Error generating diagram with Gemini: ${JSON.stringify(error)}`);
    }
  }
}

// Save diagram function remains the same
export async function saveDiagram(name: string, description: string, nodes: Node[], edges: Edge[]): Promise<any> {
  try {
    const response = await fetch('/api/diagrams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        nodes,
        edges,
        userId: 1, // Default user ID for now
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save diagram');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving diagram:', error);
    throw error;
  }
}

// Update diagram function remains the same
export async function updateDiagram(id: number, updates: { name?: string; description?: string; nodes?: Node[]; edges?: Edge[] }): Promise<any> {
  try {
    const response = await fetch(`/api/diagrams/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update diagram');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating diagram:', error);
    throw error;
  }
}