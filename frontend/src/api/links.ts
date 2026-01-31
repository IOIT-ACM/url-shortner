import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";

export interface LinkMetadata {
  title: string;
  description: string;
  image: string;
  favicon: string;
}

export interface Link {
  code: string;
  short_url: string;
  original_url: string;
  instagram_mode: boolean;
  created_at: string;
  metadata?: LinkMetadata;
}

export interface ShortenRequest {
  url: string;
  instagram_mode: boolean;
}

export interface LinksResponse {
  links: Link[];
  total: number;
}

async function createLink(data: ShortenRequest): Promise<Link> {
  return apiFetch("/shorten", {
    method: "POST",
    data,
  });
}

async function fetchLinks(): Promise<LinksResponse> {
  return apiFetch("/links", {
    method: "GET",
  });
}

export const linkKeys = {
  all: ["links"] as const,
  list: () => [...linkKeys.all, "list"] as const,
};

export function useShortenUrl() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: linkKeys.list() });
    },
  });
}

export function useLinks() {
  return useQuery({
    queryKey: linkKeys.list(),
    queryFn: fetchLinks,
  });
}
