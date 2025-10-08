
import { create } from 'zustand';
import { Device } from 'react-native-ble-plx';

const MAX_READINGS = 30;
function pushReading<T>(arr: T[], newItem: T): T[] {
  const newArr = [...arr, newItem];
  if (newArr.length > MAX_READINGS) newArr.shift(); // remove oldest
  return newArr;
}

interface BleInputsState {
  allDevices: Device[];
  deviceHeartRateSensor: Device | null;
  deviceSpeedSensor: Device | null;
  deviceCadenceSensor: Device | null;
  devicePowerSensor: Device | null;
  subscriptions: Record<string, (() => void) | null>;
  currentHeartRate: number;
  currentSpeed: number;
  currentCadence: number;
  currentPower: number;
  heartRateHistory: number[];
  speedHistory: number[];
  cadenceHistory: number[];
  powerHistory: number[];
}

interface BleInputsAction {
  setAllDevices: (devices: Device[]) => void;
  setDeviceHeartRateSensor: (device: Device | null) => void;
  setDeviceSpeedSensor: (device: Device | null) => void;
  setDeviceCadenceSensor: (device: Device | null) => void;
  setDevicePowerSensor: (device: Device | null) => void;
  addSubscription: (deviceId: string, unsubscribe: () => void) => void;
  clearSubscription: (deviceId: string) => void;
  addHeartRateReading: (data: number) => void;
  addSpeedReading: (data: number) => void;
  addCadenceReading: (data: number) => void;
  addPowerReading: (data: number) => void;
  resetState: () => void;
}

const defaultBleState: BleInputsState = {
  allDevices: [],
  deviceHeartRateSensor: null,
  deviceSpeedSensor: null,
  deviceCadenceSensor: null,
  devicePowerSensor: null,
  subscriptions: {},
  currentHeartRate: 0,
  currentSpeed: 0,
  currentCadence: 0,
  currentPower: 0,
  heartRateHistory: [],
  speedHistory: [],
  cadenceHistory: [],
  powerHistory: [],
};

export type BleState = BleInputsState & BleInputsAction;

export const useBleState = create<BleState>()((set) => ({
  ...defaultBleState,
  setAllDevices: (devices: Device[]) => set({ allDevices: devices }),
  setDeviceHeartRateSensor: (device: Device | null) => set({ deviceHeartRateSensor: device }),
  setDeviceSpeedSensor: (device: Device | null) => set({ deviceSpeedSensor: device }),
  setDeviceCadenceSensor: (device: Device | null) => set({ deviceCadenceSensor: device }),
  setDevicePowerSensor: (device: Device | null) => set({ devicePowerSensor: device }),
  addSubscription: (deviceId, unsubscribe) =>
    set((state) => ({
      subscriptions: { ...state.subscriptions, [deviceId]: unsubscribe },
    })),
  clearSubscription: (deviceId) =>
    set((state) => {
      const newSubs = { ...state.subscriptions };
      delete newSubs[deviceId];
      return { subscriptions: newSubs };
    }),
  addHeartRateReading: (data) =>
    set((state) => ({
      currentHeartRate: data,
      heartRateHistory: pushReading(state.heartRateHistory, data),
    })),
  addSpeedReading: (data) =>
    set((state) => ({
      currentSpeed: data,
      speedHistory: pushReading(state.speedHistory, data),
    })),
  addCadenceReading: (data) =>
    set((state) => ({
      currentCadence: data,
      cadenceHistory: pushReading(state.cadenceHistory, data),
    })),
  addPowerReading: (data) =>
    set((state) => ({
      currentPower: data,
      powerHistory: pushReading(state.powerHistory, data),
    })),
  resetState: () => set({ ...defaultBleState }),
}));
