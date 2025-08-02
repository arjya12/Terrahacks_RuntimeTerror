# Implementation Plan: MedReconcile Pro

This plan outlines the development of the MedReconcile Pro application, focusing on a React Native/Expo frontend and a Python/FastAPI backend. The key constraint for this implementation is the exclusion of any database setup or data persistence. All data will be mocked or handled in-memory for the current scope.

## Phase 1: Setup & Foundation

- [ ] **Initialize Project Structure**: Create separate directories for the `frontend` (React Native/Expo) and `backend` (Python/FastAPI).
- [ ] **Install Frontend Dependencies**:
  - `expo`, `react-native`
  - `@clerk/clerk-expo` for authentication
  - `expo-router` for navigation
  - `expo-camera` for the scanner
  - `react-native-qrcode-svg` for QR generation
  - `zod` for data validation
- [ ] **Install Backend Dependencies**:
  - `fastapi`
  - `uvicorn`
  - `pydantic`
  - `python-multipart` for image uploads
- [ ] **Create Mock Data & Services**:
  - `medication-list.json`: A file containing a list of mock medications.
  - `mock-user-profile.json`: A file with a mock user profile.
  - `mock-api-service.ts`: A frontend service to simulate API calls and manage in-memory data, respecting the "no database" rule.
- [ ] **Setup Basic FastAPI Server**: Create the main `main.py` file with a basic FastAPI app instance and a health check endpoint.
- [ ] **Frontend Authentication Setup**:
  - Configure the Clerk provider in the root layout of the Expo app.
  - Create the sign-in and sign-up screens using Clerk's components.
  - Set up protected routes that require authentication.
- [ ] **Basic Navigation Structure**:
  - Implement a tab navigator for the main app sections (e.g., Medication List, Scan, Profile).
  - Set up a stack navigator for authentication flow and other stacked screens (e.g., Edit Medication).

## Phase 2: Core Feature Implementation

- [ ] **Build Medication List Screen**:
  - Fetch and display the list of mock medications from the `mock-api-service`.
  - Implement UI for Add, Edit, and Delete buttons.
- [ ] **Implement Add/Edit Medication Form**:
  - Create a reusable form component for adding and editing medication details.
  - Use `zod` for client-side validation.
  - Connect the form to the `mock-api-service` to update the in-memory list.
- [ ] **Build Pill Bottle Scanner Screen**:
  - Integrate `expo-camera` to create the camera interface.
  - Implement a capture button that simulates sending an image to the backend.
  - Create a mock backend endpoint (`/scan-medication`) that receives the request and returns a pre-defined, structured JSON object representing scanned medication data.
  - Display the returned mock data to the user for confirmation.
- [ ] **Implement Secure Sharing Feature**:
  - **Frontend**: Create a "Share List" screen that generates a QR code from a mock sharing token string.
  - **Backend**: Create a mock endpoint (`/generate-share-token`) that returns a fake, static token.
- [ ] **Implement Provider Viewing Feature**:
  - **Frontend**: Build a "Scan QR" screen for providers that uses the camera to read QR codes.
  - Upon a successful scan, simulate a call to a mock backend endpoint (`/view-shared-list`) with the token data.
  - The mock backend endpoint will return the complete mock medication list.
  - Display the fetched medication list in a read-only view.

## Phase 3: Testing & Polish

- [ ] **Refine UI/UX**:
  - Add loading states (spinners, skeleton loaders) for simulated API calls.
  - Handle basic error cases (e.g., camera permission denied, invalid QR code format).
- [ ] **Enhance Empty States**: Improve the UI for when the medication list is empty, encouraging users to add medications.
- [ ] **Component Documentation**: Write basic documentation in the code for major components, explaining their props and usage.

## Excluded for Later

- **Database Setup**: No MongoDB or any other database will be configured or connected.
- **Data Persistence**: All medication lists and user data will be reset when the app is closed.
- **Real AI/OCR Integration**: The backend will not make real calls to Google Cloud Vision or RxNav APIs. The `/scan-medication` endpoint will be a mock that returns static, pre-defined data to simulate a successful scan.
- **Backend Authentication Logic**: While the frontend will be protected by Clerk, the backend endpoints will only simulate token validation and will not include real token verification logic.
