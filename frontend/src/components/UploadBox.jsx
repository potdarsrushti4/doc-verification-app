"use client";

import { useDropzone } from "react-dropzone";

export default function UploadBox({ setFile }) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    },
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-400 p-10 rounded-xl text-center cursor-pointer hover:bg-gray-50"
    >
      <input {...getInputProps()} />
      <p className="text-lg text-gray-700">Drag & drop a document here</p>
      <p className="text-gray-500">or click to upload</p>
    </div>
  );
}