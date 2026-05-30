"use client";

import React, { createContext, useContext, useMemo } from "react";
import { ARCA_PORTAL_URL } from "./constants";

interface ArcaContextType {
  apiKey: string;
  portalUrl: string;
  isConfigured: boolean;
}

const ArcaContext = createContext<ArcaContextType | null>(null);

export interface ArcaProviderProps {
  apiKey: string;
  children: React.ReactNode;
}

export const ArcaProvider = ({ apiKey, children }: ArcaProviderProps) => {
  const value = useMemo(() => ({
    apiKey,
    portalUrl: ARCA_PORTAL_URL,
    isConfigured: !!apiKey
  }), [apiKey]);

  return <ArcaContext.Provider value={value}>{children}</ArcaContext.Provider>;
};

export const useArcaConfig = () => {
  const context = useContext(ArcaContext);
  if (!context) {
    throw new Error("Arca components must be used within a ArcaProvider");
  }
  return context;
};
