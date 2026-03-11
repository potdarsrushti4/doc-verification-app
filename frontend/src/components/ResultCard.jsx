export default function ResultCard({ result }) {

  if (!result) return null;

  const confidencePercent = Math.round(result.confidence * 100);

  const isFake = result.status === "Fake";

  return (

    <div className="mt-8 w-full">

      <div className="bg-white shadow-lg rounded-xl p-6 border">

        {/* Status Badge */}
        <div className="flex justify-between items-center mb-4">

          <h2 className="text-xl font-bold text-gray-900">
            Verification Result
          </h2>

          <span
            className={`px-4 py-1 rounded-full text-sm font-semibold
            ${isFake ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
          >
            {isFake ? "FAKE DOCUMENT" : "AUTHENTIC"}
          </span>

        </div>


        {/* Confidence Bar */}
        <div className="mb-4">

          <p className="text-sm text-gray-600 mb-1">
            Confidence
          </p>

          <div className="w-full bg-gray-200 rounded-full h-3">

            <div
              className={`h-3 rounded-full
              ${isFake ? "bg-red-500" : "bg-green-500"}`}
              style={{ width: `${confidencePercent}%` }}
            ></div>

          </div>

          <p className="text-sm mt-1 text-gray-700">
            {confidencePercent}%
          </p>

        </div>


        {/* Extracted Details */}
        <div className="space-y-1 text-gray-700">

          <p><strong>Name:</strong> {result.name || "Not detected"}</p>

          <p><strong>DOB:</strong> {result.dob || "Not detected"}</p>

          <p><strong>Document Type:</strong> {result.document_type}</p>

        </div>

      </div>

    </div>

  );

}