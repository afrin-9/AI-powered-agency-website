import type { Timeline } from "@prisma/client";

// Multipliers applied to the base estimate depending on how fast the client needs delivery.
export const TIMELINE_MULTIPLIER: Record<Timeline, number> = {
  RUSH: 1.25,
  NORMAL: 1,
  FLEXIBLE: 0.9,
};

export const QUOTE_SPREAD = 0.15; // +/- 15% range shown to the client

export interface QuoteInput {
  basePrice: number;
  pricePerFeature: number;
  features: number;
  timeline: Timeline;
}

export interface QuoteResult {
  min: number;
  max: number;
  point: number;
}

/** Rounds to the nearest 50 USD so estimates look like real quotes. */
function roundTo50(value: number) {
  return Math.round(value / 50) * 50;
}

/**
 * Estimate = (base + features x pricePerFeature) x timeline multiplier, shown as a +/-15% range.
 * The first feature is included in the base price.
 */
export function calculateQuote(input: QuoteInput): QuoteResult {
  const { basePrice, pricePerFeature, features, timeline } = input;
  if (!Number.isInteger(features) || features < 1 || features > 50) {
    throw new RangeError("features must be an integer between 1 and 50");
  }
  if (basePrice < 0 || pricePerFeature < 0) {
    throw new RangeError("prices must be non-negative");
  }
  const extraFeatures = features - 1;
  const point = (basePrice + extraFeatures * pricePerFeature) * TIMELINE_MULTIPLIER[timeline];
  return {
    point: roundTo50(point),
    min: roundTo50(point * (1 - QUOTE_SPREAD)),
    max: roundTo50(point * (1 + QUOTE_SPREAD)),
  };
}
