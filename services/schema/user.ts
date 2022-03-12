import { Project } from "./project.ts";

export interface User {
  name: string; // Github UUID
  firstTime: boolean;
  teams?: string[];

  // Injected values
  projects: Project[];
}
