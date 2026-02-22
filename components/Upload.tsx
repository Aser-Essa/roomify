import { Check, ImageIcon, UploadIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router";
import {
  ACCEPTED_TYPES,
  PROGRESS_INCREMENT,
  PROGRESS_INTERVAL_MS,
  REDIRECT_DELAY_MS,
} from "../lib/constants";

interface UploadProps {
  onComplete: (base64: string) => void;
}

export default function Upload({ onComplete }: UploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileReaderRef = useRef<FileReader | null>(null);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (fileReaderRef.current) {
        fileReaderRef.current.abort();
      }
    };
  }, []);

  const { isSignedIn } = useOutletContext<AuthContext>();

  const processFile = (selectedFile: File) => {
    if (!isSignedIn) return;
    if (!ACCEPTED_TYPES.includes(selectedFile.type)) return;

    setFile(selectedFile);
    setProgress(0);

    const reader = new FileReader();

    reader.onerror = () => {
      setFile(null);
      setProgress(0);
    };

    fileReaderRef.current = reader;
    reader.onload = (e) => {
      const base64 = e.target?.result as string;

      let currentProgress = 0;
      progressIntervalRef.current = setInterval(() => {
        currentProgress += PROGRESS_INCREMENT;
        if (currentProgress >= 100) {
          currentProgress = 100;
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          setTimeout(() => {
            onComplete(base64);
          }, REDIRECT_DELAY_MS);
        }
        setProgress(currentProgress);
      }, PROGRESS_INTERVAL_MS);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSignedIn) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSignedIn) return;
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSignedIn) return;
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSignedIn) return;
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) return;
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <>
      <div className="upload">
        {!file ? (
          <div
            className={`dropzone ${isDragging ? "is-dragging" : ""}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              className="drop-input"
              accept=".jpg,.jpeg,.png"
              disabled={!isSignedIn}
              onChange={handleChange}
            />
            <div className="drop-content">
              <div className="drop-icon">
                <UploadIcon size={20} />
              </div>
              <p>
                {isSignedIn
                  ? "Click to upload or just drag and drop"
                  : "Sign in or sign up with Puter to upload"}
              </p>
              <p className="help">Maximum file size 50 MB.</p>
            </div>
          </div>
        ) : (
          <div className="upload-status">
            <div className="status-content">
              <div className="status-icon">
                {progress >= 100 ? (
                  <Check className="check" />
                ) : (
                  <ImageIcon className="image" />
                )}
              </div>
              <h3>{file?.name}</h3>
              <div className="progress">
                <div className="bar" style={{ width: `${progress}%` }} />
                <p className="status-text">
                  {" "}
                  {progress < 100
                    ? "Analyzing Floor Plan..."
                    : "Redirecting..."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
