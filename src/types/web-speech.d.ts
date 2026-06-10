interface Window {
  SpeechRecognition?: new () => unknown;
  webkitSpeechRecognition?: new () => unknown;
  BarcodeDetector?: new (options?: { formats?: string[] }) => {
    detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
  };
}
