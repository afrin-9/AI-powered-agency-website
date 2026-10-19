import { ApiError, clientIp, handle, json } from "@/lib/api";
import { prisma } from "@/lib/db";
import { calculateQuote } from "@/lib/quote";
import { rateLimit } from "@/lib/rateLimit";
import { parseBody, quoteEstimateSchema } from "@/lib/validation";

export const POST = handle(async (req) => {
  rateLimit(`quote:${clientIp(req)}`, 60, 60 * 1000);
  const { serviceId, features, timeline } = await parseBody(req, quoteEstimateSchema);
  const service = await prisma.service.findFirst({ where: { id: serviceId, active: true } });
  if (!service) throw new ApiError(404, "Service not found");
  const quote = calculateQuote({
    basePrice: service.basePrice,
    pricePerFeature: service.pricePerFeature,
    features,
    timeline,
  });
  return json({ ...quote, typicalWeeks: service.typicalWeeks });
});
