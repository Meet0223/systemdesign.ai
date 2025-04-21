import { users, type User, type InsertUser, diagrams, type Diagram, type InsertDiagram, type Node, type Edge } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Diagram operations
  getDiagram(id: number): Promise<Diagram | undefined>;
  getDiagramsByUserId(userId: number): Promise<Diagram[]>;
  createDiagram(diagram: InsertDiagram): Promise<Diagram>;
  updateDiagram(id: number, diagram: Partial<InsertDiagram>): Promise<Diagram | undefined>;
  deleteDiagram(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private diagrams: Map<number, Diagram>;
  private currentUserId: number;
  private currentDiagramId: number;

  constructor() {
    this.users = new Map();
    this.diagrams = new Map();
    this.currentUserId = 1;
    this.currentDiagramId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Diagram operations
  async getDiagram(id: number): Promise<Diagram | undefined> {
    return this.diagrams.get(id);
  }

  async getDiagramsByUserId(userId: number): Promise<Diagram[]> {
    return Array.from(this.diagrams.values()).filter(
      (diagram) => diagram.userId === userId
    );
  }

  async createDiagram(insertDiagram: InsertDiagram): Promise<Diagram> {
    const id = this.currentDiagramId++;
    const diagram: Diagram = { ...insertDiagram, id };
    this.diagrams.set(id, diagram);
    return diagram;
  }

  async updateDiagram(id: number, updates: Partial<InsertDiagram>): Promise<Diagram | undefined> {
    const existingDiagram = this.diagrams.get(id);
    if (!existingDiagram) {
      return undefined;
    }

    const updatedDiagram = { ...existingDiagram, ...updates };
    this.diagrams.set(id, updatedDiagram);
    return updatedDiagram;
  }

  async deleteDiagram(id: number): Promise<boolean> {
    return this.diagrams.delete(id);
  }
}

export const storage = new MemStorage();
