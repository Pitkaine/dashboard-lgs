export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import ReviewsClient from "./ReviewsClient";

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { position: "asc" },
  });

  return <ReviewsClient reviews={reviews} />;
}
