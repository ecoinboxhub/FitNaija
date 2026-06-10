import ChallengeDetailClient from "./client";

export function generateStaticParams() {
  return [{ id: "c1" }, { id: "c2" }, { id: "c3" }, { id: "c4" }];
}

export default async function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChallengeDetailClient id={id} />;
}
