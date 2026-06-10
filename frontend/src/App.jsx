import { useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleImageChange(event) {
    const file = event.target.files[0];

    if (!file) return;

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError("");
  }

  function handleClear() {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
    setError("");
  }

  async function handleDetect() {
    if (!selectedImage) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedImage);

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Prediction failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <p className="text-emerald-400 font-semibold mb-2">
            YOLOv8 Computer Vision System
          </p>
          <h1 className="text-4xl md:text-5xl font-bold">
            AI Solar Panel Defect Detection
          </h1>
          <p className="text-slate-400 mt-4">
            Upload a solar panel image and detect defects using a trained AI model.
          </p>
        </header>

        <main className="grid md:grid-cols-2 gap-8">
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">Upload Image</h2>

            <label className="block border-2 border-dashed border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-400 transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <span className="text-slate-300">
                Click to upload solar panel image
              </span>
            </label>

            {previewUrl && (
              <img
                src={previewUrl}
                alt="Selected solar panel"
                className="mt-6 rounded-xl w-full max-h-96 object-contain bg-slate-950 border border-slate-800"
              />
            )}

            {error && <p className="mt-4 text-red-400 font-medium">{error}</p>}

            <button
              onClick={handleDetect}
              disabled={loading}
              className="mt-6 w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-950 font-bold py-3 rounded-xl transition"
            >
              {loading ? "Analyzing..." : "Detect Defects"}
            </button>

            <button
              onClick={handleClear}
              className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition"
            >
              Clear
            </button>
          </section>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4">Detection Results</h2>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 min-h-64">
              {!result && !loading && (
                <div className="text-center py-10">
                  <p className="text-5xl mb-3">🔍</p>
                  <p className="text-slate-400">
                    Upload an image and run detection.
                  </p>
                </div>
              )}

              {loading && (
                <div className="text-center py-10">
                  <div className="animate-pulse">
                    <p className="text-5xl mb-3">🤖</p>
                    <p className="text-emerald-400 font-bold">
                      Running YOLOv8 Analysis...
                    </p>
                  </div>
                </div>
              )}

              {result && (
                <div>
                  <p className="text-slate-300 mb-4">
                    File: <span className="text-white">{result.filename}</span>
                  </p>

                  <div className="mb-4 bg-slate-900 border border-slate-800 rounded-lg p-4">
                    <p className="text-emerald-400 font-bold">
                      Total Detections: {result.detections.length}
                    </p>
                  </div>

                  {result.detections.length > 0 ? (
                    <div className="space-y-3">
                      {result.detections.map((item, index) => (
                        <div
                          key={index}
                          className="bg-slate-900 border border-slate-800 rounded-lg p-4"
                        >
                          <p className="font-bold text-emerald-400">
                            {item.class_name}
                          </p>
                          <p className="text-slate-400">
                            Confidence: {(item.confidence * 100).toFixed(0)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-yellow-400">
                      No defects detected in this image.
                    </p>
                  )}

                  {result.prediction_image && (
                    <img
                      src={`${API_BASE_URL}${result.prediction_image}`}
                      alt="Prediction result"
                      className="mt-6 rounded-xl w-full max-h-96 object-contain bg-slate-900 border border-slate-800"
                    />
                  )}
                </div>
              )}
            </div>
          </section>
        </main>

        <footer className="text-center mt-12 text-slate-500 text-sm">
          Powered by YOLOv8 • FastAPI • React • Tailwind CSS
        </footer>
      </div>
    </div>
  );
}

export default App;
