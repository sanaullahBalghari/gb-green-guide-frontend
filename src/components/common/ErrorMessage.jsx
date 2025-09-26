// src/components/common/ErrorMessage.jsx
import { AlertCircle } from "lucide-react";

export default function ErrorMessage({ message = "Something went wrong.", showReload = true }) {
  return (
    <div className="flex flex-col items-center justify-center p-6  mx-auto">
      <AlertCircle className="text-red-500 w-10 h-10 mb-3" />
      <p className="text-red-700 font-semibold mb-2">{message}</p>
      {/* {showReload && (
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Reload Page
        </button>
      )} */}
    </div>
  );
}
