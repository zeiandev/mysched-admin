import { get } from "@vercel/edge-config";

export type Features = {
  import_enabled: boolean;
  beta_ui?: boolean;
};

/** Reads and normalizes feature flags from Edge Config */
export async function getFlags(): Promise<Features> {
  const raw = await get<Partial<Features> | null>("features");
  return {
    import_enabled: Boolean(raw && (raw as any).import_enabled),
    beta_ui: Boolean(raw && (raw as any).beta_ui),
  };
}
