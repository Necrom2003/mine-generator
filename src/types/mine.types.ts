export type Level = {
  mine: number;
  level: number;
  time: number | null;
  emeralds: number;
};

export type Assignment = {
  mine: number;
  level: number;
  emeralds: number;
  time: number | null;
  rate: number;
  cycles?: number;
};