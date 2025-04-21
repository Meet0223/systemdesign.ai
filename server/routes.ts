import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDiagramSchema, insertUserSchema, nodeSchema, edgeSchema } from "@shared/schema";
import { z } from "zod";

// Google Generative AI integration
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "your-api-key");

const diagramPromptSchema = z.object({
  prompt: z.string().min(5, "Prompt must be at least 5 characters long"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for users
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      return res.status(201).json(user);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  // API routes for diagrams
  app.get("/api/diagrams", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const diagrams = await storage.getDiagramsByUserId(userId);
      return res.json(diagrams);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/diagrams/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid diagram ID" });
      }
      
      const diagram = await storage.getDiagram(id);
      if (!diagram) {
        return res.status(404).json({ message: "Diagram not found" });
      }
      
      return res.json(diagram);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/diagrams", async (req: Request, res: Response) => {
    try {
      const diagramData = insertDiagramSchema.parse(req.body);
      const diagram = await storage.createDiagram(diagramData);
      return res.status(201).json(diagram);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/diagrams/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid diagram ID" });
      }
      
      const updates = req.body;
      const updatedDiagram = await storage.updateDiagram(id, updates);
      
      if (!updatedDiagram) {
        return res.status(404).json({ message: "Diagram not found" });
      }
      
      return res.json(updatedDiagram);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/diagrams/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid diagram ID" });
      }
      
      const success = await storage.deleteDiagram(id);
      if (!success) {
        return res.status(404).json({ message: "Diagram not found" });
      }
      
      return res.status(204).send();
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  // API route for generating diagrams with Google Gemini
  app.post("/api/generate-diagram", async (req: Request, res: Response) => {
    try {
      console.log("Received diagram generation request");
      const { prompt } = diagramPromptSchema.parse(req.body);
      console.log("Validated prompt:", prompt);
      
      // Verify API key
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("GEMINI_API_KEY is not set in environment variables");
        return res.status(500).json({ message: "Gemini API key is missing" });
      }
      console.log("API key is configured");
      
      // Prepare the prompt for Gemini
      const aiPrompt = `
        Generate a system architecture diagram based on the following description:
        "${prompt}"
        
        Create a detailed JSON response with two arrays:
        1. "nodes" - Each node should have: id, type (server, database, api, loadBalancer, security, storage), 
           position (x, y coordinates), data (label, description)
        2. "edges" - Each edge should have: id, source (node id), target (node id), and optional label
        
        Return only valid JSON without code blocks or other text. The JSON should look like:
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
      `;
      
      console.log("Initializing Gemini model");
      
      // Re-initialize genAI with the current API key from environment
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Use Gemini 1.5 Flash model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      console.log("Sending request to Gemini API");
      
      // Generate content with Gemini
      const result = await model.generateContent(aiPrompt);
      console.log("Received response from Gemini");
      
      const response = result.response;
      const responseContent = response.text();
      console.log("Extracted text from response:", responseContent.substring(0, 100) + "...");
      
      if (!responseContent) {
        console.error("No content returned from Gemini");
        return res.status(500).json({ message: "Failed to generate diagram: No content returned from Gemini" });
      }
      
      try {
        // Find JSON in the response
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error("No JSON pattern found in response");
          return res.status(500).json({
            message: "No valid JSON found in response", 
            responseText: responseContent.substring(0, 500) // Send part of the response for debugging
          });
        }
        
        console.log("Found JSON in response");
        
        // Parse the JSON
        const parsedResponse = JSON.parse(jsonMatch[0]);
        console.log("Parsed JSON:", JSON.stringify(parsedResponse).substring(0, 100) + "...");
        
        // Check if nodes and edges exist
        if (!parsedResponse.nodes || !parsedResponse.edges) {
          console.error("Nodes or edges missing in response:", parsedResponse);
          return res.status(500).json({
            message: "Invalid diagram structure: missing nodes or edges",
            response: parsedResponse
          });
        }
        
        // Validate the generated nodes and edges
        const nodes = z.array(nodeSchema).parse(parsedResponse.nodes);
        const edges = z.array(edgeSchema).parse(parsedResponse.edges);
        
        console.log("Returning valid diagram with", nodes.length, "nodes and", edges.length, "edges");
        return res.json({ nodes, edges });
      } catch (parseError: any) {
        console.error("Error parsing Gemini response:", parseError);
        return res.status(500).json({ 
          message: "Failed to parse Gemini-generated diagram", 
          error: parseError.message,
          responseContent: responseContent.substring(0, 500) // Send part of the response for debugging
        });
      }
    } catch (error: any) {
      console.error("Error generating diagram:", error);
      const errorDetails = error instanceof Error 
        ? { name: error.name, message: error.message, stack: error.stack }
        : { error: JSON.stringify(error) };
        
      return res.status(error.status || 500).json({ 
        message: "Failed to generate diagram", 
        error: errorDetails
      });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
