export type GpuReading = {
  gpu: string;
  name: string;
  utilization_percent: number | null;
  vram_bytes: number | null;
};
// Parses only stable DCGM series, rejects arbitrary prometheus labels and non-finite values.
export function parseDcgm(text: string): GpuReading[] {
  const devices = new Map<string, GpuReading>();
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith("#")) continue;
    const matched = line.match(
      /^(DCGM_FI_DEV_GPU_UTIL|DCGM_FI_DEV_FB_USED)\{([^}]*)\}\s+([0-9.eE+-]+)/,
    );
    if (!matched) continue;
    const labels = Object.fromEntries(
      Array.from(
        (matched[2] ?? "").matchAll(/([a-zA-Z_]+)="([^"\n]{0,80})"/g),
      ).map((x) => [x[1], x[2]]),
    );
    const id = labels.gpu ?? labels.UUID;
    if (!id || !/^[a-zA-Z0-9:_-]{1,80}$/.test(id)) continue;
    const value = Number(matched[3]);
    if (!Number.isFinite(value) || value < 0) continue;
    const current = devices.get(id) ?? {
      gpu: id,
      name: labels.modelName ?? "NVIDIA GPU",
      utilization_percent: null,
      vram_bytes: null,
    };
    if (matched[1] === "DCGM_FI_DEV_GPU_UTIL")
      current.utilization_percent = Math.min(100, value);
    else current.vram_bytes = value * 1024 * 1024;
    devices.set(id, current);
    if (devices.size > 32) break;
  }
  return Array.from(devices.values());
}
