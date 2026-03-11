"use client";

export default function ImagePreview({ file }) {
  if (!file) return null;

  const imageUrl = URL.createObjectURL(file);

  return (
    <div className="mt-6">
      <img
        src={imageUrl}
        alt="preview"
        className="rounded-lg shadow-md max-h-80"
      />
    </div>
  );
}