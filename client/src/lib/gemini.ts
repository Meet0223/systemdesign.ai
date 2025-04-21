import { GoogleGenerativeAI } from '@google/generative-ai';
import { Node, Edge } from '@/lib/types';

interface GenerateDiagramRequest {
  prompt: string;
}

interface GenerateDiagramResponse {
  nodes: Node[];
  edges: Edge[];
}

// Initialize the Gemini API
export const initGemini = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is missing. Please set the VITE_GEMINI_API_KEY environment variable.');
  }
  return new GoogleGenerativeAI(apiKey);
};

// Generate diagram using Gemini 2.0 Flash
export async function generateDiagram(prompt: string): Promise<GenerateDiagramResponse> {
  try {
    const genAI = initGemini();
    
    // For Gemini 2.0 Flash model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const diagramPrompt = `
    Generate a system architecture diagram based on the following description:
    
    "${prompt}"
    
    Return a JSON response with nodes and edges. Format:
    {
      "nodes": [
        {
          "id": "unique-string-id",
          "type": "default",
          "position": { "x": number, "y": number },
          "data": {
            "label": "Component Name",
            "type": "server|database|api|loadBalancer|security|storage",
            "description": "Brief description",
            "style": {
              "backgroundColor": "#FFFFFF",
              "borderColor": "#CBD5E0",
              "textColor": "#1A202C",
              "borderWidth": 1
            }
          }
        }
      ],
      "edges": [
        {
          "id": "unique-string-id",
          "source": "node-id-source",
          "target": "node-id-target",
          "label": "connection description",
          "style": {
            "strokeColor": "#CBD5E0",
            "strokeWidth": 2
          }
        }
      ]
    }
    
    Nodes should be properly positioned in a logical layout, with x and y coordinates that don't overlap. Use appropriate node types based on component purpose.
    `;

    const result = await model.generateContent(diagramPrompt);
    const response = result.response;
    const text = response.text();
    
    // Find JSON in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No valid JSON found in response");
    
    // Parse the JSON
    const jsonResponse = JSON.parse(jsonMatch[0]);
    
    return {
      nodes: jsonResponse.nodes || [],
      edges: jsonResponse.edges || []
    };
  } catch (error) {
    console.error('Error generating diagram with Gemini:', error);
    throw error;
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