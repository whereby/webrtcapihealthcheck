export function getWebRtcApiHealth(): {
  version: number;
  missing: string[];
  nonNative: string[];
  error?: string;
};
