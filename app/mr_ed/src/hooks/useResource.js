import { useEffect, useState } from "react";
import api from "../api";
import waitForBackend from "../backendReady";

export default function useResource(
  path,
  interval = 0,
  { checkReadiness = false } = {},
) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    let pending = false;
    let ready = !checkReadiness;
    const controller = new AbortController();
    const fetchData = async () => {
      if (pending) return;
      pending = true;
      setRefreshing(true);
      setError("");
      try {
        if (!ready) {
          await waitForBackend(controller.signal);
          ready = true;
        }
        const response = await api.get(path, { signal: controller.signal });
        if (active) {
          setData(response.data);
          setError("");
          setUpdatedAt(new Date());
        }
      } catch (err) {
        if (active)
          setError(
            err.response?.status === 401
              ? "Your session has ended. Please log in again."
              : "We couldn’t load the latest information. Please try again.",
          );
      } finally {
        pending = false;
        if (active) setRefreshing(false);
      }
    };
    fetchData();
    const timer = interval ? setInterval(fetchData, interval) : null;
    return () => {
      active = false;
      controller.abort();
      clearInterval(timer);
    };
  }, [path, interval, version, checkReadiness]);
  return {
    data,
    error,
    refreshing,
    updatedAt,
    loading: data === null && !error,
    refresh: () => setVersion((value) => value + 1),
  };
}
