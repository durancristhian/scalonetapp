type DownloadBlob = (blob: Blob, fileName: string) => void;

export const downloadBlob: DownloadBlob = (blob, fileName) => {
  const url = window.URL.createObjectURL(new Blob([blob]));

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);

  document.body.appendChild(link);

  link.click();

  window.URL.revokeObjectURL(url);
};
