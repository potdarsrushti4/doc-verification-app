import { useState } from "react";
import axios from "axios";
import { FiUploadCloud } from "react-icons/fi"; // optional: for upload icon
import { motion } from "framer-motion"; // for fade-in animation


const UploadForm = () => {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

        if (!selected) {
            setError("Please select a file.");
            setFile(null);
            return;
        }

        if (!allowedTypes.includes(selected.type)) {
            setError("Unsupported file type. Please upload JPG, PNG, or PDF.");
            setFile(null);
            return;
        }

        setFile(selected);
        setError("");
        setResult(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("No file selected. Please upload a document.");
            return
        };
        setError("");
        const formData = new FormData();
        formData.append("document", file);

        try {
            setLoading(true);
            const res = await axios.post("http://localhost:5000/api/verify", formData);

            setResult(res.data);
        } catch (err) {
            console.error("Error:", err);
            setResult({ result: "Error", confidence: 0 });
        } finally {
            setLoading(false);
        }
    };
    return (

        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-100 p-4"
        >
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
                <div className="flex flex-col items-center mb-6">
                    <FiUploadCloud className="text-4xl text-indigo-600 mb-2" />
                    <h1 className="text-2xl font-semibold text-gray-800">Document Verification</h1>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              hover:file:bg-indigo-100"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 text-white font-medium py-2 px-4 rounded-full hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {loading ? "Verifying..." : "Upload & Verify"}
                    </button>
                </form>
                {error && (
                    <div className="text-red-600 text-sm mt-2 text-center">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center items-center mt-4 text-indigo-600">
                        <svg
                            className="animate-spin h-5 w-5 mr-2 text-indigo-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                            ></path>
                        </svg>
                        <span>Verifying document...</span>
                    </div>
                )}

                {result && (

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`mt-6 text-center p-5 rounded-xl shadow-md border-2 
      ${result.status === "real"
                                ? "bg-green-50 border-green-400 text-green-800"
                                : result.status === "fake"
                                    ? "bg-red-50 border-red-400 text-red-800"
                                    : "bg-gray-50 border-gray-300 text-gray-700"
                            }`}
                    >
                        <p className="text-xl font-bold mb-1">{result.status}</p>
                        <p className="text-sm font-medium">Confidence: {result.confidence}%</p>
                    </motion.div>
                )}

            </div>
        </motion.div>
    );
};

export default UploadForm;
