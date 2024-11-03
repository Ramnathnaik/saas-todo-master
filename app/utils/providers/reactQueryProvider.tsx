"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useState } from "react";

const useQueryClient = () => {
  const [queryClient] = useState(() => new QueryClient());
  return queryClient;
};

const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default ReactQueryProvider;
