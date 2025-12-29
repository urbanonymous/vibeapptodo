import { create } from "zustand";
import type { Project } from "../types/models";

type ProjectState = {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
};

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects })
}));

