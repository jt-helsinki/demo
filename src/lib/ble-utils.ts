import { Platform } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import { createMockBleManager } from '@/lib/mock-ble-manager';

let bleManager: BleManager;
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  try {
    const BleManager = require('react-native-ble-plx').BleManager;
    bleManager = new BleManager();
  } catch {
    // We're probably in Expo Go or the module isn't installed
    bleManager = createMockBleManager();
  }
} else {
  bleManager = createMockBleManager();
}

export function bleManagerInstance() {
  return bleManager;
}

export const HEART_RATE_SERVICE_UUID = '180D';
export const CYCLING_POWER_SERVICE_UUID = '1818';
export const CYCLING_SPEED_CADENCE_SERVICE_UUID = '1816';
export const CYCLING_SPEED_SERVICE_UUID = '1816';
export const CYCLING_CADENCE_SERVICE_UUID = '1816';

export function isFitnessSensor(device: Device) {
  return (
    (device?.serviceUUIDs || [])
      .map((serviceUUID) => serviceUUID.toUpperCase())
      .some((serviceUUID) => {
        const firstToken = serviceUUID.toUpperCase().split('-').pop();
        return !!(
          firstToken?.includes(HEART_RATE_SERVICE_UUID) ||
          firstToken?.includes(CYCLING_POWER_SERVICE_UUID) ||
          firstToken?.includes(CYCLING_SPEED_CADENCE_SERVICE_UUID)
        );
      }) ||
    (device.localName &&
      /heart|power|cadence|speed/i.test(String(device.localName).toLowerCase())) ||
    (device.name && /heart|power|cadence|speed/i.test(String(device.name).toLowerCase()))
  );
}

export function filterDevices(devices: Device[], ...serviceUUIDs: string[]) {
  return (devices || []).filter((device) => {
    if (!device.serviceUUIDs || device.serviceUUIDs.length === 0) return false;

    // Check if the device has at least one of the requested service UUIDs
    return device.serviceUUIDs.some((uuid) =>
      serviceUUIDs.some((serviceUUID) => {
        const firstToken = uuid.toUpperCase().split('-').reverse().pop();
        return !!firstToken && firstToken.includes(serviceUUID.toUpperCase());
      })
    );
  });
}

export function isDuplicteDevice(devices: Device[], nextDevice: Device): boolean {
  return devices.findIndex((device) => nextDevice.id === device.id) > -1;
}

// Heart Rate (UUID 2A37)
// Usually: first byte = flags, second byte = heart rate (uint8 or uint16 depending on flag)
export function parseHeartRate(bytes: Uint8Array): number {
  if (!bytes || bytes.length < 2) return 0;
  const flags = bytes[0];
  const hr16bit = flags & 0x01; // LSB of flags indicates 16-bit value
  return hr16bit ? bytes[1] | (bytes[2] << 8) : bytes[1];
}

// Speed (from Cycling Speed and Cadence, 2A5B or custom)
// Usually: cumulative wheel revolutions (uint32) and last event time (uint16)
export function parseSpeed(bytes: Uint8Array): number {
  if (!bytes || bytes.length < 6) return 0;
  const cumulativeRevolutions = bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);
  const lastEventTime = bytes[4] | (bytes[5] << 8); // in 1/1024s
  const wheelCircumference = 2.105; // meters (example: 700x23c wheel)
  const speed = (cumulativeRevolutions * wheelCircumference) / (lastEventTime / 1024); // m/s
  return speed * 3.6; // convert to km/h
}

// Cadence (from Cycling Speed and Cadence, 2A5B or custom)
// Usually: cumulative crank revolutions (uint16) and last event time (uint16)
export function parseCadence(bytes: Uint8Array): number {
  if (!bytes || bytes.length < 4) return 0;
  const cumulativeCrankRevolutions = bytes[0] | (bytes[1] << 8);
  const lastEventTime = bytes[2] | (bytes[3] << 8); // in 1/1024s
  const cadence = (cumulativeCrankRevolutions * 60 * 1024) / lastEventTime; // rpm
  return Math.round(cadence);
}

// Power (from Cycling Power, 2A63)
// Usually: instantaneous power (uint16)
export function parsePower(bytes: Uint8Array): number {
  if (!bytes || bytes.length < 2) return 0;
  return bytes[0] | (bytes[1] << 8); // watts
}
