import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import ResizeObserver from 'resize-observer-polyfill';

global.ResizeObserver = ResizeObserver;

vi.mock('react-native', () => {
    return {
        Platform: { OS: 'ios', select: () => null },
        PermissionsAndroid: {
            request: vi.fn(),
            RESULTS: { GRANTED: 'granted' },
        },
        NativeModules: {},
        View: () => null,
        Text: () => null,
        // add any other RN exports your tests use
    };
});

vi.mock('react-native-ble-plx', () => {
    return {
        BleManager: vi.fn().mockImplementation(() => ({
            startDeviceScan: vi.fn(),
            stopDeviceScan: vi.fn(),
            connectToDevice: vi.fn(),
        })),
    };
});

beforeEach(() => {

});

afterEach(() => {
    cleanup();
});
