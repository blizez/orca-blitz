import { useCallback, useEffect, useState } from "react";
import type { AgentEvent } from "@orca-blitz/shared";

export interface UseAgentState {
  isStreaming: boolean;
  model?: string;
  thinkingLevel?: string;
  events: AgentEvent[];
  availableModels: Array<{ id: string; name: string; provider: string }>;
  providers: Array<{ id: string; name: string; available: boolean; authenticated: boolean }>;
  error?: string;
}

export interface UseAgentActions {
  send: (message: string, images?: string[]) => Promise<void>;
  steer: (message: string) => Promise<void>;
  abort: () => Promise<void>;
  setModel: (provider: string, modelId: string) => Promise<void>;
  setThinkingLevel: (level: string) => Promise<void>;
  login: (providerId: string) => Promise<{ success: boolean }>;
  refreshState: () => Promise<void>;
  refreshModels: () => Promise<void>;
  clearEvents: () => void;
}

export type UseAgentReturn = UseAgentState & UseAgentActions & { unavailable: boolean };

function getAgentApi(): Window["api"]["agent"] | undefined {
  const w = window as unknown as { api?: Window["api"] };
  return w.api?.agent;
}

export function useAgent(): UseAgentReturn {
  const [state, setState] = useState<UseAgentState>({
    isStreaming: false,
    model: undefined,
    thinkingLevel: undefined,
    events: [],
    availableModels: [],
    providers: [],
    error: undefined,
  });
  const [unavailable, setUnavailable] = useState(() => !getAgentApi());

  const refreshState = useCallback(async () => {
    const api = getAgentApi();
    if (!api) {
      setUnavailable(true);
      return;
    }
    try {
      const s = await api.getState();
      setState((prev) => ({
        ...prev,
        isStreaming: s.isStreaming,
        model: s.model,
        thinkingLevel: s.thinkingLevel,
      }));
    } catch (err) {
      setState((prev) => ({ ...prev, error: err instanceof Error ? err.message : String(err) }));
    }
  }, []);

  const refreshModels = useCallback(async () => {
    const api = getAgentApi();
    if (!api) return;
    try {
      const [models, providers] = await Promise.all([
        api.getAvailableModels(),
        api.getLoginProviders(),
      ]);
      setState((prev) => ({ ...prev, availableModels: models, providers }));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const api = getAgentApi();
    if (!api) {
      setUnavailable(true);
      return;
    }
    setUnavailable(false);

    let unsubEvent: (() => void) | undefined;
    let unsubDisc: (() => void) | undefined;
    let initError: string | undefined;

    try {
      unsubEvent = api.onEvent((ev: unknown) => {
        if (!ev || typeof ev !== "object" || !("type" in ev)) return;
        const typed = ev as AgentEvent;
        setState((prev) => {
          const next = [...prev.events, typed];
          if (next.length > 1000) next.shift();
          let isStreaming = prev.isStreaming;
          if (
            typed.type === "agent_start" ||
            typed.type === "turn_start" ||
            typed.type === "message_start"
          )
            isStreaming = true;
          if (typed.type === "agent_end" || typed.type === "turn_end") isStreaming = false;
          return { ...prev, events: next, isStreaming };
        });
      });
    } catch (err) {
      initError = err instanceof Error ? err.message : String(err);
    }

    try {
      unsubDisc = api.onDisconnected((code) => {
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          error: `OMP disconnected code=${code ?? "?"}`,
        }));
      });
    } catch {
      // ignore
    }

    if (initError) {
      setState((prev) => ({ ...prev, error: initError }));
    }

    void refreshState();
    void refreshModels();

    return () => {
      unsubEvent?.();
      unsubDisc?.();
    };
  }, [refreshModels, refreshState]);

  const send = useCallback(async (message: string, images?: string[]) => {
    const api = getAgentApi();
    if (!api) throw new Error("agent unavailable in web mode");
    setState((prev) => ({ ...prev, isStreaming: true, error: undefined }));
    await api.send(message, images);
  }, []);

  const steer = useCallback(async (message: string) => {
    const api = getAgentApi();
    if (!api) throw new Error("agent unavailable in web mode");
    await api.steer(message);
  }, []);

  const abort = useCallback(async () => {
    const api = getAgentApi();
    if (!api) throw new Error("agent unavailable in web mode");
    await api.abort();
    setState((prev) => ({ ...prev, isStreaming: false }));
  }, []);

  const setModel = useCallback(
    async (provider: string, modelId: string) => {
      const api = getAgentApi();
      if (!api) throw new Error("agent unavailable in web mode");
      await api.setModel(provider, modelId);
      await refreshState();
    },
    [refreshState],
  );

  const setThinkingLevel = useCallback(
    async (level: string) => {
      const api = getAgentApi();
      if (!api) throw new Error("agent unavailable in web mode");
      await api.setThinkingLevel(level);
      await refreshState();
    },
    [refreshState],
  );

  const login = useCallback(
    async (providerId: string) => {
      const api = getAgentApi();
      if (!api) throw new Error("agent unavailable in web mode");
      const res = await api.login(providerId);
      await refreshModels();
      return res;
    },
    [refreshModels],
  );

  const clearEvents = useCallback(() => setState((prev) => ({ ...prev, events: [] })), []);

  return {
    ...state,
    send,
    steer,
    abort,
    setModel,
    setThinkingLevel,
    login,
    refreshState,
    refreshModels,
    clearEvents,
    unavailable,
  };
}
