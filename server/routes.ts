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
        Generate a DETAILED, ENTERPRISE-GRADE distributed system architecture diagram based on the following description:
        "${prompt}"
        
        Create a comprehensive JSON response with two arrays:
        1. "nodes" - Each node should have: id, type, data (label, description, style)
        2. "edges" - Each edge should have: id, source (node id), target (node id), and label
        
        REQUIREMENTS:
        - Create a HIGHLY DETAILED, distributed systems architecture (minimum 12-15 components)
        - Include scalability mechanisms (load balancers, replication, sharding)
        - Include security layers, caching mechanisms, monitoring services
        - Show data flow patterns with specific protocols and methods

        IMPORTANT: Do NOT include position coordinates for nodes. Node positioning will be handled by the layout engine.
        
        Node types to use (choose appropriate ones):
        frontend, server, database, api, loadBalancer, security, storage, media, cdn, processing, player
        
        Node styling:
        - Use appealing, distinctive colors for different node types:
           * Frontend/UI: #8B5CF6 (purple)
           * CDN/Delivery: #EF7C4F (orange)
           * Media/Storage: #3B82F6 (blue)
           * Processing/Encoding: #7C3AED (indigo)
           * Server/API: #10B981 (green)
           * Database: #F59E0B (amber)
           * Security: #EF4444 (red)
        - Ensure high contrast between background and text (white text)
        - Each node must have a detailed description of its role (1-2 sentences)
        
        Edge styling:
        - Add technical labels showing protocols or data types (e.g., "HTTP/REST", "gRPC", "Kafka", "RTMP", etc.)
        - Every edge should have animated: true
        
        Create logical connections between components that follow the natural data flow of the system.
        
        Return only valid JSON without code blocks or other text. The JSON should look like:
        {
          "nodes": [
            {
              "id": "node1",
              "type": "media",
              "data": {
                "label": "Live Stream Ingest Service",
                "type": "media",
                "description": "Receives, validates and processes incoming video streams via RTMP protocol",
                "style": {
                  "backgroundColor": "#3B82F6", 
                  "borderColor": "#2563EB",
                  "textColor": "#FFFFFF",
                  "borderWidth": 2,
                  "borderRadius": 8,
                  "padding": 16
                }
              }
            }
          ],
          "edges": [
            {
              "id": "edge1",
              "source": "node1",
              "target": "node2",
              "label": "RTMP/SRT",
              "type": "straight",
              "animated": true,
              "style": {
                "strokeColor": "#64748B",
                "strokeWidth": 2,
                "strokeDasharray": "5,5"
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
        // Extract JSON from the response text - handle markdown code blocks
        let jsonText = '';
        
        // First, try to extract JSON from markdown code blocks
        const codeBlockMatch = responseContent.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
          console.log("Found JSON in markdown code block");
          jsonText = codeBlockMatch[1];
        } else {
          // Fall back to regular JSON pattern match
          const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            console.error("No JSON pattern found in response");
            return res.status(500).json({
              message: "No valid JSON found in response", 
              responseText: responseContent.substring(0, 500) // Send part of the response for debugging
            });
          }
          console.log("Found JSON with regular pattern match");
          jsonText = jsonMatch[0];
        }
        
        console.log("Extracted JSON text:", jsonText.substring(0, 100) + "...");
        
        // Parse the JSON with error handling
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(jsonText);
          console.log("Parsed JSON:", JSON.stringify(parsedResponse).substring(0, 100) + "...");
        } catch (jsonError) {
          console.error("JSON parse error:", jsonError);
          return res.status(500).json({
            message: "Failed to parse JSON from Gemini response", 
            error: String(jsonError),
            responseText: jsonText.substring(0, 500)
          });
        }
        
        // Check if nodes and edges exist
        if (!parsedResponse.nodes || !parsedResponse.edges) {
          console.error("Nodes or edges missing in response:", parsedResponse);
          return res.status(500).json({
            message: "Invalid diagram structure: missing nodes or edges",
            response: parsedResponse
          });
        }
        
        // Create custom validation to handle variations in the response structure
        try {
          // Initialize nodes with default positions (will be laid out by client)
          const nodes = parsedResponse.nodes.map((node: any) => {
            // Return a validated node object with default position
            return {
              id: String(node.id),
              type: node.type || 'default',
              position: { x: 0, y: 0 }, // Default position, will be set by layout engine
              data: {
                label: String(node.data.label),
                description: node.data.description || '',
                type: node.data.type || 'server',
                style: node.data.style || {}
              }
            };
          });
          
          // Validate edges with more flexible schema
          const edges = parsedResponse.edges.map((edge: any) => {
            return {
              id: String(edge.id),
              source: String(edge.source),
              target: String(edge.target),
              label: edge.label || '',
              type: 'straight', // Always use straight edges
              animated: edge.animated !== undefined ? edge.animated : true,
              style: edge.style || {
                strokeColor: '#64748B',
                strokeWidth: 2,
                strokeDasharray: '5,5'
              }
            };
          });
          
          console.log("Returning valid diagram with", nodes.length, "nodes and", edges.length, "edges");
          return res.json({ nodes, edges });
        } catch (validationError: any) {
          console.error("Error validating diagram data:", validationError);
          return res.status(500).json({
            message: "Failed to validate diagram structure",
            error: validationError.message,
            rawData: parsedResponse
          });
        }
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
