import { apiRequest } from "./queryClient";
import { Node, Edge } from "./types";

// Interface for diagram generation request and response
interface GenerateDiagramRequest {
  prompt: string;
}

interface GenerateDiagramResponse {
  nodes: Node[];
  edges: Edge[];
}

// Function to generate a diagram based on user's natural language prompt
export async function generateDiagram(
  prompt: string
): Promise<GenerateDiagramResponse> {
  try {
    const response = await apiRequest(
      "POST", 
      "/api/generate-diagram", 
      { prompt } as GenerateDiagramRequest
    );
    
    const data = await response.json();
    return data as GenerateDiagramResponse;
  } catch (error) {
    console.error("Error generating diagram:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate diagram");
  }
}

// Function to save a diagram
export async function saveDiagram(
  name: string,
  description: string,
  userId: number,
  nodes: Node[],
  edges: Edge[]
) {
  try {
    const response = await apiRequest("POST", "/api/diagrams", {
      name,
      description,
      userId,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error saving diagram:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to save diagram");
  }
}

// Function to update an existing diagram
export async function updateDiagram(
  id: number,
  updates: {
    name?: string;
    description?: string;
    nodes?: Node[];
    edges?: Edge[];
  }
) {
  try {
    const response = await apiRequest("PUT", `/api/diagrams/${id}`, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    
    return await response.json();
  } catch (error) {
    console.error("Error updating diagram:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update diagram");
  }
}
