import { get } from "@vercel/edge-config";

export async function getFlags() {
  // Reads the "features" object from your Edge Config store
  const data = await get("features");
  return data ?? {};
}
