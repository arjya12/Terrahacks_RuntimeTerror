import "@testing-library/jest-native/extend-expect";
import "react-native-gesture-handler/jestSetup";

// Mock Expo modules
jest.mock("expo-constants", () => ({
  executionEnvironment: "standalone",
}));

jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));

jest.mock("expo-font", () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
}));

jest.mock("expo-camera", () => ({
  Camera: {
    Constants: {
      Type: {
        back: "back",
        front: "front",
      },
    },
  },
  useCameraPermissions: () => [{ granted: true }, jest.fn()],
  CameraView: "CameraView",
}));

jest.mock("@clerk/clerk-expo", () => ({
  ClerkProvider: ({ children }) => children,
  useAuth: () => ({
    isSignedIn: false,
    isLoaded: true,
    signOut: jest.fn(),
    getToken: jest.fn(),
  }),
  useUser: () => ({
    user: null,
  }),
  useSignIn: () => ({
    signIn: {
      create: jest.fn(),
    },
    setActive: jest.fn(),
    isLoaded: true,
  }),
  useSignUp: () => ({
    signUp: {
      create: jest.fn(),
      attemptEmailAddressVerification: jest.fn(),
    },
    setActive: jest.fn(),
    isLoaded: true,
  }),
  tokenCache: {},
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  Stack: {
    Screen: "Screen",
  },
  Tabs: {
    Screen: "Screen",
  },
  Link: "Link",
}));

// Global fetch mock
global.fetch = jest.fn();

// Mock FormData
global.FormData = jest.fn(() => ({
  append: jest.fn(),
}));

// Silence console warnings in tests
console.warn = jest.fn();
console.error = jest.fn();
