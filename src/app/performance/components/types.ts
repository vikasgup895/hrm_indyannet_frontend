export type AppraisalStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "IN_REVIEW"
  | "VERIFIED"
  | "FEEDBACK_SUBMITTED"
  | "CLOSED"
  | "REOPENED";

export type AppraisalRating =
  | "BELOW_EXPECTATIONS"
  | "MEETS_EXPECTATIONS"
  | "EXCEEDS_EXPECTATIONS";

export type RatingOption = {
  label: string;
  value: AppraisalRating;
};

export type GoalInputRow = {
  title: string;
  metric?: string;
  targetDate?: string;
};

export type DevelopmentInputRow = {
  goal: string;
  activities: string;
  timeline?: string;
  resources?: string;
};
