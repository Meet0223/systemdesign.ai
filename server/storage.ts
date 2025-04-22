import { users, type User, type InsertUser, diagrams, type Diagram, type InsertDiagram, type Node, type Edge } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Diagram operations
  getDiagram(id: number): Promise<Diagram | undefined>;
  getDiagramsByUserId(userId: number): Promise<Diagram[]>;
  createDiagram(diagram: InsertDiagram): Promise<Diagram>;
  updateDiagram(id: number, diagram: Partial<InsertDiagram>): Promise<Diagram | undefined>;
  deleteDiagram(id: number): Promise<boolean>;

  // Database management
  clearAllTables(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Diagram operations
  async getDiagram(id: number): Promise<Diagram | undefined> {
    const [diagram] = await db.select().from(diagrams).where(eq(diagrams.id, id));
    return diagram;
  }

  async getDiagramsByUserId(userId: number): Promise<Diagram[]> {
    return await db.select().from(diagrams).where(eq(diagrams.userId, userId));
  }

  async createDiagram(insertDiagram: InsertDiagram): Promise<Diagram> {
    // Add timestamps for created and updated
    const now = new Date().toISOString();
    
    // Create the new diagram record
    const [diagram] = await db
      .insert(diagrams)
      .values({
        ...insertDiagram,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    
    return diagram;
  }

  async updateDiagram(id: number, updates: Partial<InsertDiagram>): Promise<Diagram | undefined> {
    // Update the diagram with the provided updates
    const [updatedDiagram] = await db
      .update(diagrams)
      .set({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(diagrams.id, id))
      .returning();
    
    return updatedDiagram;
  }

  async deleteDiagram(id: number): Promise<boolean> {
    const result = await db
      .delete(diagrams)
      .where(eq(diagrams.id, id))
      .returning({ id: diagrams.id });
    
    return result.length > 0;
  }

  // Database management
  async clearAllTables(): Promise<void> {
    try {
      console.log("Clearing all database tables...");
      
      // Delete all records in diagrams table
      await db.delete(diagrams);
      console.log("Cleared diagrams table");
      
      // Delete all records in users table
      await db.delete(users);
      console.log("Cleared users table");
      
      console.log("All tables have been cleared successfully");
    } catch (error) {
      console.error("Error clearing database tables:", error);
      throw error;
    }
  }
}

// Initialize the database storage
export const storage = new DatabaseStorage();
