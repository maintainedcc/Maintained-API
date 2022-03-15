import { Project } from "./project.ts";

export interface User {
  id: string;
  name: string; // Github UUID
  firstTime: boolean;

  // Sharing
  claims: string[];
  teams?: string[];

  // Injected values
  projects: Project[];
}
