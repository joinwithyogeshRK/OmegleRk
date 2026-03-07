import "./App.css";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Room from "./components/Room";
import Landing from "./components/Landing";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignIn,
} from "@clerk/clerk-react";

function App() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <BrowserRouter>
        <Routes>
         
          <Route
            path="/"
            element={
              <>
                <SignedIn><Landing /></SignedIn>
                <SignedOut><Navigate to="/sign-in" /></SignedOut>
              </>
            }
          />

         
          <Route
            path="/room"
            element={
              <>
                <SignedIn><Room /></SignedIn>
                <SignedOut><Navigate to="/sign-in" /></SignedOut>
              </>
            }
          />

          
          <Route
            path="/sign-in/*"
            element={
              <div
                className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center"
                style={{ backgroundImage: "url('/bg.avif')" }}
              >
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative z-10">
                  <SignIn routing="path" path="/sign-in" forceRedirectUrl="/" />
                </div>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  );
}

export default App;

         
        