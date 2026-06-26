import { useRef, useState } from 'react';
import { isLottieData } from '../lib/lottie-validate';
import styles from './Uploader.module.css';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB soft warning threshold

/**
 * Reads the picked/dropped files, validates them as Lottie JSON, and
 * hands the accepted ones back to the parent.
 *
 * Invalid or unparseable files are reported via `onError` so the user
 * gets a toast; nothing crashes and nothing leaks through.
 */
async function readFiles(
  fileList: FileList,
  onAdd: (files: { name: string; data: object }[]) => void,
  onError: (msg: string) => void,
) {
  const accepted: { name: string; data: object }[] = [];
  for (const file of Array.from(fileList)) {
    if (file.size > MAX_BYTES) {
      onError(`${file.name} is larger than 5MB and may load slowly.`);
    }
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!isLottieData(data)) {
        onError(`${file.name} is not a valid Lottie file.`);
        continue;
      }
      accepted.push({ name: file.name, data });
    } catch {
      onError(`${file.name} could not be parsed as JSON.`);
    }
  }
  if (accepted.length) onAdd(accepted);
}

type Props = {
  onAdd: (files: { name: string; data: object }[]) => void;
  onError: (msg: string) => void;
};

export function Uploader({ onAdd, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <div
      className={`${styles.dropzone} ${over ? styles.over : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (e.dataTransfer.files.length) {
          readFiles(e.dataTransfer.files, onAdd, onError);
        }
      }}
    >
      Drop Lottie JSON here, or click to choose files
      <input
        ref={inputRef}
        className={styles.input}
        type="file"
        accept="application/json,.json"
        multiple
        onChange={(e) => {
          if (e.target.files?.length) {
            readFiles(e.target.files, onAdd, onError);
          }
          // Reset so picking the same file again still triggers `change`.
          e.target.value = '';
        }}
      />
    </div>
  );
}