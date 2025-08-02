# MedReconcile Pro - Component Documentation

## Overview

MedReconcile Pro is a React Native mobile application built with Expo for medication reconciliation. This document provides detailed information about the components, their usage, and architecture.

## Architecture

### Tech Stack

- **Frontend**: React Native with Expo SDK
- **Navigation**: Expo Router (file-based routing)
- **Authentication**: Clerk
- **Styling**: StyleSheet with TypeScript
- **Animations**: React Native Animated API
- **Camera**: Expo Camera
- **State Management**: React Hooks (useState, useCallback, useEffect)
- **Data Validation**: Zod schemas
- **Mock Data**: JSON files with in-memory operations

### Project Structure

```
app/
├── (auth)/           # Authentication routes
├── (home)/           # Authenticated user screens
├── (tabs)/           # Main tab navigation
└── components/       # Shared UI components

mocks/
├── types.ts          # TypeScript interfaces and Zod schemas
├── *.json           # Mock data files
└── mockService.ts   # Data service layer
```

## Core Components

### 1. Medication List Screen (`app/(tabs)/index.tsx`)

**Purpose**: Main screen displaying user's medication list with CRUD operations.

**Features**:

- ✅ Real-time loading states
- ✅ Animated card entries
- ✅ Search and filter functionality
- ✅ Empty state with call-to-action buttons
- ✅ Pull-to-refresh
- ✅ Accessibility support

**Key Components**:

- `MedicationsScreen`: Main container component
- `MedicationCard`: Individual medication display with animations
- `EditModal`: Form for adding/editing medications

**Usage Example**:

```tsx
// Automatic rendering via Expo Router
// Access via /(tabs)/ route
```

**State Management**:

```tsx
const [medications, setMedications] = useState<Medication[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [isDeleting, setIsDeleting] = useState<string | null>(null);
const [isSaving, setIsSaving] = useState(false);
```

**Animations**:

- Card fade-in and scale animations on load
- Modal slide-up animation
- Pulse animation on add button when list is empty
- Loading state transitions

### 2. Camera Scan Screen (`app/(tabs)/explore.tsx`)

**Purpose**: Camera interface for scanning pill bottles with OCR simulation.

**Features**:

- ✅ Expo Camera integration
- ✅ Mock OCR processing
- ✅ Camera permissions handling
- ✅ Guided scanning interface
- ✅ Processing states and error handling

**Key Components**:

- `ScanScreen`: Main camera container
- Camera overlay with scanning frame
- Permission request UI
- Processing indicators

**Usage**:

```tsx
// Access via /(tabs)/explore route
// Requires camera permissions
```

**Camera Setup**:

```tsx
const [permission, requestPermission] = useCameraPermissions();
const camera = useRef<CameraView>(null);
```

### 3. Provider Sharing (`app/(home)/sharing.tsx`)

**Purpose**: Generate and manage QR codes for sharing medication lists with healthcare providers.

**Features**:

- ✅ QR code generation
- ✅ Configurable sharing permissions
- ✅ Expiration date management
- ✅ Active/inactive token states

**Components**:

- `SharingScreen`: Main sharing interface
- `CreateShareModal`: Form for creating new shares
- `QRDisplayModal`: QR code display

### 4. QR Code Scanner (`app/(home)/scan-share.tsx`)

**Purpose**: Scan QR codes to view shared medication lists.

**Features**:

- ✅ QR code scanning with Expo Camera
- ✅ Token validation
- ✅ Medication list display
- ✅ Manual code entry option

## Data Layer

### Mock Service (`mocks/mockService.ts`)

**Purpose**: Centralizes all data operations for the frontend.

**Key Methods**:

```tsx
// Medication operations
getMedications(): Medication[]
addMedication(medication: Partial<Medication>): Medication
updateMedication(id: string, updates: Partial<Medication>): void
deleteMedication(id: string): void

// OCR simulation
mockOCRProcessing(imagePath: string): Promise<OCRResult>

// Sharing operations
createSharingToken(patientId: string, permissions: string[], hours: number): SharingToken
getSharingToken(token: string): SharingToken | null
```

### Data Types (`mocks/types.ts`)

**Core Interfaces**:

```tsx
interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  prescriber: string;
  pharmacy: string;
  dateCreated: string;
  isActive: boolean;
  confidence: number;
  notes?: string;
}

interface SharingToken {
  id: string;
  token: string;
  patientId: string;
  permissions: string[];
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}
```

## Styling Guidelines

### Design System

- **Primary Color**: `#3b82f6` (Blue)
- **Success Color**: `#10b981` (Green)
- **Warning Color**: `#f59e0b` (Amber)
- **Danger Color**: `#ef4444` (Red)
- **Text Colors**: `#1f2937`, `#6b7280`

### Component Patterns

```tsx
// Card pattern
const cardStyle = {
  backgroundColor: "white",
  borderRadius: 12,
  padding: 16,
  marginVertical: 8,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
};

// Button pattern
const buttonStyle = {
  backgroundColor: "#3b82f6",
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 8,
  alignItems: "center" as const,
};
```

## Accessibility Features

### Implementation

- Semantic labels for all interactive elements
- Screen reader support with `accessibilityLabel` and `accessibilityHint`
- High contrast color combinations
- Touch target sizing (minimum 44x44 points)
- Focus management for modals

### Example Usage

```tsx
<TouchableOpacity
  accessibilityLabel="Add new medication"
  accessibilityHint="Opens a form to add a new medication manually"
  accessibilityRole="button"
>
  <Text>Add Medication</Text>
</TouchableOpacity>
```

## Performance Optimizations

### Implemented Optimizations

1. **Memoization**: `useCallback` for stable function references
2. **Lazy Loading**: Deferred loading of non-critical components
3. **Animated Drivers**: Native driver usage for smooth animations
4. **List Optimization**: FlatList with proper keyExtractor

### Animation Performance

```tsx
// Using native driver for better performance
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // ✅ Runs on native thread
}).start();
```

## Error Handling

### Strategy

1. **User-Friendly Messages**: Clear, actionable error messages
2. **Graceful Degradation**: Fallback states for failures
3. **Loading States**: Visual feedback during operations
4. **Retry Mechanisms**: Allow users to retry failed operations

### Implementation Example

```tsx
try {
  await mockDataService.addMedication(data);
  Alert.alert("Success", "Medication added successfully!");
} catch (error) {
  Alert.alert("Error", "Failed to add medication. Please try again.");
} finally {
  setIsSaving(false);
}
```

## Testing Strategy

### Approaches

1. **Component Testing**: React Native Testing Library
2. **Integration Testing**: End-to-end user flows
3. **Accessibility Testing**: Screen reader compatibility
4. **Performance Testing**: Animation smoothness and memory usage

### Mock Data Testing

All components are tested with realistic mock data that simulates:

- Various medication types and dosages
- Different confidence levels from OCR
- Edge cases (empty lists, network failures)

## Future Enhancements

### Planned Features

1. **Real API Integration**: Replace mock services with actual backend
2. **Offline Support**: Local storage and sync capabilities
3. **Push Notifications**: Medication reminders
4. **Drug Interactions**: Real-time checking with pharmacy APIs
5. **Barcode Scanning**: Additional input method for medications

### Performance Improvements

1. **Image Caching**: Optimize camera image handling
2. **Background Processing**: Move OCR to background threads
3. **Pagination**: For large medication lists
4. **Search Optimization**: Debounced search with indexing

## Development Guidelines

### Code Style

- TypeScript strict mode enabled
- Functional components preferred
- Descriptive variable names with auxiliary verbs
- Early returns for error conditions

### Component Structure

```tsx
// 1. Imports
import React from "react";

// 2. Interfaces
interface ComponentProps {
  // prop definitions
}

// 3. Component
function Component({ prop }: ComponentProps) {
  // 4. Hooks and state
  // 5. Effects
  // 6. Handlers
  // 7. Render
}

// 8. Styles
const styles = StyleSheet.create({
  // styles
});

// 9. Export
export default Component;
```

### Git Workflow

- Feature branches for new functionality
- Meaningful commit messages
- Code review before merging
- Automated testing on PRs

This documentation serves as a comprehensive guide for understanding, maintaining, and extending the MedReconcile Pro application.
