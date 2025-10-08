import { PermissionsAndroid, Platform } from 'react-native';
import * as ExpoDevice from 'expo-device';
import base64 from 'react-native-base64';
import { BleError, Characteristic, Device, LogLevel } from 'react-native-ble-plx';
import {
  bleManagerInstance,
  isDuplicteDevice,
  isFitnessSensor,
  parseCadence,
  parseHeartRate,
  parsePower,
  parseSpeed,
} from '@/lib/ble-utils';
import { useBleState } from '@/state/ble-state';
import { SensorType } from '@/model/ble';
import * as Sentry from '@sentry/react-native';

// Shared type for real + mock
type BLEApi = {
  connectToDevice: (device: any) => Promise<void>;
  allDevices: any[];
  connectedDevice: any | null;
  color: string;
  requestPermissions: () => Promise<boolean>;
  scanForPeripherals: () => void;
  startStreamingData: (device: any) => void;
};

const bleManager = bleManagerInstance();
if (bleManager) {
  bleManager.setLogLevel(LogLevel.Verbose);
}

export function useBLE() {
  const {
    allDevices,
    setAllDevices,
    deviceHeartRateSensor,
    setDeviceHeartRateSensor,
    deviceSpeedSensor,
    setDeviceSpeedSensor,
    deviceCadenceSensor,
    setDeviceCadenceSensor,
    devicePowerSensor,
    setDevicePowerSensor,
  } = useBleState();

  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: 'Location Permission',
        message: 'Bluetooth Low Energy requires Location',
        buttonPositive: 'OK',
      }
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: 'Location Permission',
        message: 'Bluetooth Low Energy requires Location',
        buttonPositive: 'OK',
      }
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Bluetooth Low Energy requires Location',
        buttonPositive: 'OK',
      }
    );

    return (
      bluetoothScanPermission === 'granted' &&
      bluetoothConnectPermission === 'granted' &&
      fineLocationPermission === 'granted'
    );
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth Low Energy requires Location',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionsGranted = await requestAndroid31Permissions();

        return isAndroid31PermissionsGranted;
      }
    } else {
      return true;
    }
  };

  const conectDeviceHeartRateSensor = (deviceId: string): Promise<Device | null> => {
    return connectToDevice(deviceId, '180D', '2A37', 'heartRate', setDeviceHeartRateSensor);
  };
  const conectDeviceSpeedSensor = (deviceId: string): Promise<Device | null> => {
    return connectToDevice(deviceId, '1816', '2A5B', 'speed', setDeviceSpeedSensor);
  };
  const conectDeviceCadenceSensor = (deviceId: string): Promise<Device | null> => {
    return connectToDevice(deviceId, '1816', '2A5B', 'cadence', setDeviceCadenceSensor);
  };
  const conectDevicePowerSensor = (deviceId: string): Promise<Device | null> => {
    return connectToDevice(deviceId, '1818', '2A63', 'power', setDevicePowerSensor);
  };

  const connectToDevice = async (
    deviceId: string,
    serviceUUID: string,
    characteristicUUID: string,
    sensorType: SensorType,
    setDeviceCallback: (device: Device) => void
  ): Promise<Device | null> => {
    try {
      const deviceConnection = await bleManager.connectToDevice(deviceId);
      setDeviceCallback(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      startStreamingData(deviceConnection, serviceUUID, characteristicUUID, sensorType);
      return deviceConnection;
    } catch (e) {
      console.log('FAILED TO CONNECT', e);
      return null;
    }
  };

  const scanForPeripherals = async (): Promise<void> => {
    const isPermissionsEnabled = await requestPermissions();
    if (!isPermissionsEnabled) {
      return;
    }

    const subscription = bleManager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        bleManager.startDeviceScan(null, null, (error: BleError | null, device: Device | null) => {
          if (error) {
            console.log('Scan error:', error);
            return;
          }
          if (!device) return;

          if (isFitnessSensor(device) && !isDuplicteDevice(allDevices, device)) {
            setAllDevices([...allDevices, device]);
          }
        });

        subscription?.remove(); // stop listening after powered on
      }
    }, true);
  };

  const stopScanForPeripherals = async (): Promise<void> => {
    await bleManager.stopDeviceScan();
  };

  const startStreamingData = async (
    device: Device,
    serviceUUID: string,
    characteristicUUID: string,
    sensorType: SensorType
  ) => {
    if (!device) {
      console.log('⚠️ No device connected');
      return;
    }

    console.log(`📡 Listening to data from ${device.name || device.id}...`);

    // Start monitoring the characteristic for this device
    const subscription = device.monitorCharacteristicForService(
      serviceUUID,
      characteristicUUID,
      (error, characteristic) => onDataUpdateForSensor(error, characteristic, device, sensorType)
    );

    // Save the unsubscribe handler in Zustand
    useBleState.getState().addSubscription(device.id, () => subscription.remove());
  };

  const onDataUpdateForSensor = (
    error: BleError | null,
    characteristic: Characteristic | null,
    device: Device,
    sensorType: SensorType
  ) => {
    if (error) {
      console.log(`❌ [${device.name}] Error receiving ${sensorType} data:`, error);
      return;
    }

    if (!characteristic?.value) return;

    const rawData = base64.decode(characteristic.value);
    const bytes = new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));

    switch (sensorType) {
      case 'heartRate':
        const heartRate = parseHeartRate(bytes);
        console.log(`❤️ [${device.name}] HR: ${heartRate} bpm`);
        useBleState.getState().addHeartRateReading(heartRate);
        break;
      case 'speed':
        // Parse speed from bytes
        const speed = parseSpeed(bytes);
        console.log(`🚴 [${device.name}] Speed: ${speed} km/h`);
        useBleState.getState().addSpeedReading(speed);
        break;
      case 'cadence':
        // Parse cadence from bytes
        const cadence = parseCadence(bytes);
        console.log(`⚡ [${device.name}] Cadence: ${cadence} rpm`);
        useBleState.getState().addCadenceReading(cadence);
        break;
      case 'power':
        // Parse power from bytes
        const power = parsePower(bytes);
        console.log(`💪 [${device.name}] Power: ${power} W`);
        useBleState.getState().addPowerReading(power);
        break;
    }
  };

  return {
    connectToDevice,
    allDevices,
    conectDeviceHeartRateSensor,
    conectDeviceSpeedSensor,
    conectDeviceCadenceSensor,
    conectDevicePowerSensor,
    requestPermissions,
    scanForPeripherals,
    stopScanForPeripherals,
    startStreamingData,
    deviceHeartRateSensor,
    deviceSpeedSensor,
    deviceCadenceSensor,
    devicePowerSensor,
  };
}
