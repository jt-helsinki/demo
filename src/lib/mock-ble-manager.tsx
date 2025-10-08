import base64 from 'react-native-base64';

type MockDevice = {
  id: string;
  name: string;
  serviceUUIDs: string[];
  discoverAllServicesAndCharacteristics: () => Promise<void>;
  monitorCharacteristicForService: (
    serviceUUID: string,
    charUUID: string,
    callback: (error: any, characteristic: any) => void
  ) => void;
  readCharacteristicForService?: (serviceUUID: string, charUUID: string) => Promise<any>;
};

export function createMockBleManager(): any {
  let scanInterval: NodeJS.Timeout | null = null;
  let streamingIntervals: Record<string, NodeJS.Timeout> = {};

  const mockDevices = [
    {
      id: 'mock-power-1',
      name: 'Mock Power Sensor',
      serviceUUIDs: ['00001818-0000-1000-8000-00805f9b34fc'],
    },
    {
      id: 'mock-speed-1',
      name: 'Mock Speed Sensor',
      serviceUUIDs: [
        '00001816-0000-1000-8000-11805f9b34fb',
        '0000fsee-0000-1000-8000-00805f9b34fb',
      ],
    },
    {
      id: 'mock-cadence-1',
      name: 'Mock Speed/Cadence Sensor',
      serviceUUIDs: [
        '00001816-0000-1000-8000-11805a9b34fb',
        '0000fese-0000-1000-8000-00805f9b34fb',
      ],
    },
    {
      id: 'mock-hr-1',
      name: 'Mock Heart Rate Sensor',
      serviceUUIDs: [
        '0000180d-0000-1000-8000-00805f9b34fb',
        '0000feee-0000-1000-8000-00805f9b34fb',
      ],
    },
  ];

  const mockCharacteristics = {
    CYCLING_SPEED_CADENCE: {
      service: '1816',
      char: '2A5B',
    },
    CYCLING_POWER: {
      service: '1818',
      char: '2A63',
    },
    HEART_RATE: {
      service: '180d',
      char: '2A37',
    },
  };

  const startDeviceScan = (_uuids: any, _options: any, callback: any) => {
    console.log('[MOCK] startDeviceScan called');

    // Simulate discovering devices every second
    let index = 0;
    scanInterval = setInterval(() => {
      if (index < mockDevices.length) {
        callback(null, mockDevices[index]);
        index++;
      } else {
        clearInterval(scanInterval!);
      }
    }, 1000);
  };

  const stopDeviceScan = () => {
    console.log('[MOCK] stopDeviceScan called');
    if (scanInterval) clearInterval(scanInterval);
  };

  const connectToDevice = async (id: string): Promise<MockDevice> => {
    const found = mockDevices.find((d) => d.id === id);
    if (!found) throw new Error(`[MOCK] Device not found: ${id}`);

    console.log(`[MOCK] Connected to ${found.name}`);

    return {
      ...found,
      discoverAllServicesAndCharacteristics: async () => {
        console.log('[MOCK] discoverAllServicesAndCharacteristics called');
      },

      monitorCharacteristicForService: (
        serviceUUID: string,
        charUUID: string,
        callback: (error: any, characteristic: any) => void
      ) => {
        console.log(`[MOCK] monitorCharacteristicForService(${serviceUUID}, ${charUUID})`);

        if (streamingIntervals[id]) clearInterval(streamingIntervals[id]);

        // Mock speed/cadence/power data updates every 2 seconds
        streamingIntervals[id] = setInterval(() => {
          let data: any = {};

          if (serviceUUID === mockCharacteristics.CYCLING_SPEED_CADENCE.service) {
            data = {
              speed: (Math.random() * 12 + 5).toFixed(2), // m/s
              cadence: Math.floor(Math.random() * 50 + 70), // rpm
            };
          } else if (serviceUUID === mockCharacteristics.CYCLING_POWER.service) {
            data = {
              power: Math.floor(Math.random() * 200 + 150), // watts
            };
          } else if (serviceUUID === mockCharacteristics.HEART_RATE.service) {
            data = {
              bpm: Math.floor(Math.random() * 40 + 90), // bpm
            };
          }

          const payload = base64.encode(JSON.stringify(data));
          callback(null, {
            value: payload,
            serviceUUID,
            characteristicUUID: charUUID,
          });
        }, 2000);
      },
    };
  };

  const onStateChange = (callback: any, emitCurrentState: boolean) => {
    console.log('[MOCK] onStateChange registered');
    if (emitCurrentState) callback('PoweredOn');
    return { remove: () => console.log('[MOCK] onStateChange listener removed') };
  };

  const destroy = () => {
    console.log('[MOCK] destroy called');
    Object.values(streamingIntervals).forEach((interval) => clearInterval(interval));
  };

  return {
    startDeviceScan,
    stopDeviceScan,
    connectToDevice,
    onStateChange,
    destroy,
    requestPermissions: async () => true,
    setLogLevel: () => {},
  };
}
