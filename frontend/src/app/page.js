"use client";

import { useState } from "react";
import axios from "axios";

import UploadBox from "../components/UploadBox";
import ImagePreview from "../components/ImagePreview";
import ResultCard from "../components/ResultCard";

export default function Home() {

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const verifyDocument = async () => {

    if (!file) {
      alert("Upload a file first");
      return;
    }

    try {

      setLoading(true);
      setResult(null);

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
  "https://doc-verification-app.onrender.com/verify",
  formData
);

      setResult(response.data);

    } catch (error) {

      console.error(error);
      alert("Verification failed. Please try again.");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">

      {/* Navbar */}
      <nav className="w-full bg-white shadow-sm py-4 px-8 flex justify-between items-center">

        <h1 className="text-xl font-bold text-gray-900">
          DocuVerify AI
        </h1>

        <p className="text-gray-500 text-sm">
          AI Powered Document Fraud Detection
        </p>

      </nav>


      {/* Main Content */}
      <div className="flex items-center justify-center p-10">

        <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-4xl">

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
            AI Document Verification
          </h1>

          <p className="text-gray-600 mb-8 text-lg text-center">
            Upload an Aadhaar or Passport image to detect possible forgery using AI.
          </p>


          {/* Upload */}
          <UploadBox setFile={setFile} />


          {/* Verify Button */}
          {file && !loading && (
            <div className="flex justify-center">
              <button
                onClick={verifyDocument}
                className="mt-6 bg-blue-600 hover:bg-blue-700 active:scale-95 transition transform text-white px-8 py-3 rounded-lg font-semibold shadow-md cursor-pointer"
              >
                Verify Document
              </button>
            </div>
          )}


          {/* Loading */}
          {loading && (
            <div className="mt-6 flex flex-col items-center">

              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

              <p className="mt-3 text-blue-600 font-semibold">
                Analyzing document...
              </p>

            </div>
          )}


          {/* Image + Result Layout */}
          {(file || result) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">

              {/* Image Preview */}
              <div className="flex flex-col items-center">

                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Uploaded Document
                </h3>

                <ImagePreview file={file} />

              </div>


              {/* Result */}
              <div>

                <ResultCard result={result} />

              </div>

            </div>
          )}

        </div>

      </div>


      {/* Footer */}
      <footer className="text-center pb-6 text-gray-500 text-sm">

        Built with Next.js + FastAPI + Machine Learning

      </footer>

    </div>

  );

}
