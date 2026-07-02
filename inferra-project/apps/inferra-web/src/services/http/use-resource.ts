import { useEffect, useState } from "preact/hooks";
import { requestJson } from "./api-client";
export function useResource<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [loadedPath, setLoadedPath] = useState<string | null>(null);
  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setData(null);
    setLoadedPath(null);
    requestJson<T>(path, { signal: controller.signal })
      .then((value) => {
        setData(value);
        setLoadedPath(path);
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : "Error de red");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [path, refresh]);
  return {
    data: loadedPath === path ? data : null,
    error,
    loading: loadedPath !== path || loading,
    reload: () => setRefresh((v) => v + 1),
  };
}
