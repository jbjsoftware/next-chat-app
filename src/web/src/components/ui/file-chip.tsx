import { X } from "lucide-react";

export interface FileChipProps {
  file: File;
  onRemove: () => void;
}

const FileChip: React.FC<FileChipProps> = ({ file, onRemove }) => {
  return (
    <div className="flex items-center space-x-2 rounded-full bg-gray-200 px-3 py-1">
      <span className="text-sm text-gray-700">{file.name}</span>
      <button onClick={onRemove} className="text-gray-500 hover:text-gray-700">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default FileChip;
