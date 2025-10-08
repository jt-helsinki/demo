export interface Session {
  id: string;
  ownerId: string;
  code: string;
  venue: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  venueType: string;
  createdAt: Date;
  active: boolean;
}

export interface ValidateSessionCodeResponse {
  valid: boolean;
  id: string;
}

export interface ValidateSessionIdResponse {
  valid: boolean;
  session: Session;
}
