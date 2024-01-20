import React from 'react';

interface ExportButtonProps {
  onClick: () => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({ onClick }) => {
  return (
    <button onClick={onClick} className="export-button">
      Export to PDF
    </button>
  );
};

export default ExportButton;
