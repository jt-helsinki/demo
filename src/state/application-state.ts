
import { create } from 'zustand';

export type VenueType =
  | 'indoor-velodome'
  | 'outdoor-velodrome'
  | 'open-road'
  | 'closed-road'
  | 'other'
  | null;

export interface PhoneLocation {
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  accuracy: number | null;
  altitudeAccuracy: number | null;
}

export interface SensorSetup {
  powerSensor: string | null;
  speedSensor: string | null;
  heartRateSensor: string | null;
  cadenceSensor: string | null;
}
export interface SessionFlow {
  inProgress: boolean;
  selectedCreationOption: 'existing' | 'new';
  sessionId: string;
  sessionCode: string;
  venue: string;
  venueType: VenueType;
  active: boolean;
  location: PhoneLocation | null;
  sensorsSetup?: SensorSetup;
}

interface ApplicationInputsState {
  currentSessionId: string;
  sessionCreationFlow: SessionFlow;
}

interface ApplicationInputsAction {
  updateSessionId: (currentSessionId: string) => void;
  updateSessionCreationFlow: (sessionFlow: SessionFlow) => void;
  resetState: () => void;
}

const defaultApplicationState: ApplicationInputsState = {
  currentSessionId: '',
  sessionCreationFlow: {
    inProgress: false,
    selectedCreationOption: '' as any,
    sessionId: '',
    sessionCode: '',
    venue: '',
    venueType: '' as VenueType,
    active: true,
    location: {
      latitude: null,
      longitude: null,
      altitude: null,
      accuracy: null,
      altitudeAccuracy: null,
    },
    sensorsSetup: {
      powerSensor: null,
      speedSensor: null,
      heartRateSensor: null,
      cadenceSensor: null,
    },
  },
};

export type ApplicationState = ApplicationInputsState & ApplicationInputsAction;

export const useApplicationState = create<ApplicationState>()((set) => ({
  ...defaultApplicationState,
  updateSessionId: (currentSessionId: string) => set({ currentSessionId }),
  updateSessionCreationFlow: (sessionCreationFlow: SessionFlow) =>
    set({ sessionCreationFlow: { ...sessionCreationFlow } }),
  resetState: () => set({ ...defaultApplicationState }),
}));
