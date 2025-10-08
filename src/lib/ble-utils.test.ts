import { describe, expect, it, vi } from 'vitest';
import { Device } from 'react-native-ble-plx';
import { bleManagerInstance, filterDevices, isFitnessSensor } from './ble-utils';

// Mock react-native-ble-plx BleManager
vi.mock('react-native-ble-plx', () => {
  return {
    BleManager: vi.fn().mockImplementation(() => ({
      startDeviceScan: vi.fn(),
      stopDeviceScan: vi.fn(),
      connectToDevice: vi.fn(),
    })),
  };
});

describe('BLE Utilities', () => {
  describe('bleManagerInstance', () => {
    it('returns a BleManager instance', () => {
      const manager = bleManagerInstance();
      expect(manager).toBeDefined();
      expect(typeof manager.startDeviceScan).toBe('function');
    });
  });

  describe('isFitnessSensor', () => {
    it('detects device by serviceUUID', () => {
      const device = { serviceUUIDs: ['180D'], localName: 'Test Device' } as Device;
      expect(isFitnessSensor(device)).toBe(true);
    });

    it('detects device by localName', () => {
      const device = { serviceUUIDs: [], localName: 'Heart Rate Monitor' } as any;
      expect(isFitnessSensor(device)).toBe(true);
    });

    it('detects device by name', () => {
      const device = { serviceUUIDs: [], name: 'Cycling Power Sensor' } as any;
      expect(isFitnessSensor(device)).toBe(true);
    });

    it('returns false for unrelated devices', () => {
      const device = {
        serviceUUIDs: ['9999'],
        localName: 'Other Device',
        name: 'Random',
      } as Device;
      expect(isFitnessSensor(device)).toBe(false);
    });

    it('handles undefined serviceUUIDs gracefully', () => {
      const device = { localName: 'Heart Rate' } as Device;
      expect(isFitnessSensor(device)).toBe(true);
    });
  });

  describe('filterDevices', () => {
    const devices: Device[] = [
      { id: '1', serviceUUIDs: ['180D'], name: 'HR', localName: 'Heart Monitor' } as Device,
      { id: '2', serviceUUIDs: ['1818'], name: 'Power', localName: 'Power Sensor' } as Device,
      {
        id: '3',
        serviceUUIDs: ['1816'],
        name: 'SpeedCadence',
        localName: 'Cadence Sensor',
      } as Device,
      { id: '4', serviceUUIDs: ['9999'], name: 'Other', localName: 'Other Sensor' } as Device,
      { id: '5', serviceUUIDs: [], name: 'Empty', localName: 'No Service' } as any,
    ];

    it('filters devices by single serviceUUID', () => {
      const result = filterDevices(devices, '180D');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('filters devices by multiple serviceUUIDs', () => {
      const result = filterDevices(devices, '180D', '1818');
      expect(result).toHaveLength(2);
      const ids = result.map((d) => d.id);
      expect(ids).toContain('1');
      expect(ids).toContain('2');
    });

    it('returns empty array if no match', () => {
      const result = filterDevices(devices, '1234');
      expect(result).toHaveLength(0);
    });

    it('ignores devices with empty serviceUUIDs', () => {
      const result = filterDevices(devices, '180D', '1818', '1816');
      const ids = result.map((d) => d.id);
      expect(ids).not.toContain('5'); // device with empty serviceUUIDs
    });
  });
});
