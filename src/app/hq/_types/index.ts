export type LearningResource = {
  id: string;
  skill: string;
  type: string;
  name: string;
  url: string;
  isAffiliate: boolean;
  isFree: boolean;
  estimatedTime: string | null;
  clickCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Plan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  amount: string;
  originalAmount: string | null;
  currency: string;
  billingCycle: "monthly" | "quarterly" | "yearly";
  category: string;
  features: any[]; // { text: string, info: string | null }[]
  isActive: boolean;
  sortOrder: number;
  isGstEnabled: boolean;
  gstPercentage: string;
  createdAt: string;
  updatedAt: string;
};

export type Coupon = {
  id: string;
  code: string;
  type: "percentage" | "flat";
  value: string;
  maxDiscount: string | null;
  minOrderValue: string;
  startTime: string | null;
  endTime: string | null;
  usageLimitGlobal: number | null;
  usageLimitPerUser: number;
  newUserOnly: boolean;
  isPublic: boolean;
  status: "active" | "expired" | "disabled";
  createdAt: string;
};
