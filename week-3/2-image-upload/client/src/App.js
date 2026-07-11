import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await axios.get("/api/images");
      setImages(res.data.data);
    } catch (err) {
      setError("Failed to load images");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, GIF, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setError("");

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      await axios.post("/api/images/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPreview(null);
      setSelectedFile(null);
      fileInputRef.current.value = "";
      fetchImages();
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/images/${id}`);
      setImages(images.filter((img) => img._id !== id));
    } catch (err) {
      setError("Failed to delete image");
    }
  };

  return (
    <div className="app">
      <h1>Image Upload</h1>

      <div className="upload-section">
        <div className="upload-area" onClick={() => fileInputRef.current.click()}>
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" hidden />
          {preview ? (
            <img src={preview} alt="Preview" className="preview-image" />
          ) : (
            <p>Click to select an image</p>
          )}
        </div>

        {selectedFile && (
          <div className="file-info">
            <p>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</p>
            <button onClick={handleUpload} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        )}

        {error && <div className="error">{error}</div>}
      </div>

      <div className="gallery">
        <h2>Uploaded Images ({images.length})</h2>
        <div className="image-grid">
          {images.map((image) => (
            <div key={image._id} className="image-card">
              <img src={image.path} alt={image.originalName} />
              <div className="image-info">
                <p className="image-name">{image.originalName}</p>
                <p className="image-size">{(image.size / 1024).toFixed(1)} KB</p>
                <button className="delete-btn" onClick={() => handleDelete(image._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        {images.length === 0 && <p className="empty">No images uploaded yet.</p>}
      </div>
    </div>
  );
}

export default App;
