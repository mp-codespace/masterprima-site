import { Suspense } from "react";
import EmailLoginForm from "./login-form";

// Helper component for a simple loading state
const LoadingFallback = () => (
  <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50">
    <div className="w-full max-w-md text-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-primary-orange rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-600">Loading form...</p>
    </div>
  </div>
);

export default function EmailLoginPageContainer() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EmailLoginForm />
    </Suspense>
  );
}

