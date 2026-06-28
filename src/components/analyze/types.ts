export interface ReviewState {
  reviewSkills: string[];
  newSkill: string;
  selectedTitles: string[];
  reviewTitles: string[];
  newTitleValue: string;
  editingTitleIndex: number | null;
  editingTitleValue: string;
  experienceYears: number;
  /** Annual salary in INR. Optional — user may skip. */
  currentSalary: number | null;
}

export interface FilterState {
  searchTitle: string;
  searchLoc: string;
  workType: string;
  empType: string;
  minMatch: number[];
  requireSalary: boolean;
}
