import { ParsedResume } from "@/types";

export interface ReviewState {
  reviewSkills: string[];
  newSkill: string;
  selectedTitles: string[];
  reviewTitles: string[];
  newTitleValue: string;
  editingTitleIndex: number | null;
  editingTitleValue: string;
  experienceYears: number;
}

export interface FilterState {
  searchTitle: string;
  searchLoc: string;
  workType: string;
  empType: string;
  minMatch: number[];
  requireSalary: boolean;
}
