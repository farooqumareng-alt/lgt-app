export const CARRIERS = ["USPS", "UPS", "FedEx", "DHL"] as const;
export type Carrier = (typeof CARRIERS)[number];

const TRACKING_URL_BUILDERS: Record<Carrier, (trackingNumber: string) => string> = {
  USPS: (n) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`,
  UPS: (n) => `https://www.ups.com/track?tracknum=${n}`,
  FedEx: (n) => `https://www.fedex.com/fedextrack/?trknbr=${n}`,
  DHL: (n) => `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${n}`,
};

export function buildTrackingUrl(carrier: string, trackingNumber: string): string | null {
  const builder = TRACKING_URL_BUILDERS[carrier as Carrier];
  return builder ? builder(trackingNumber) : null;
}
