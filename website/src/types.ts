export type Language = 'en' | 'bn';
export type RiskLevel = 'NORMAL' | 'WATCH' | 'WARNING' | 'DANGER' | 'UNKNOWN';
export type District = {
  key: string;
  en: string;
  bn: string;
  lat: number;
  lon: number;
  division: string;
  aliases: string[];
};
export type DistrictSnapshot = {
  level: RiskLevel;
  peak_day: string | null;
  simulated: boolean;
};
export type ForecastSnapshot = {
  generated: string;
  districts: Record<string, DistrictSnapshot>;
};
