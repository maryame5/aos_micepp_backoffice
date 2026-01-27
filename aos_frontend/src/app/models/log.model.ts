export interface Log {
  id: number;
  userId: number;
  action: string;
  details: string;
  timestamp: string;
  userName?: string; // Optional for enriched display
}
