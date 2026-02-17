import type { UTCommandResult, UTLayer } from '@bubblydoo/uxp-toolkit';
import type { Document } from 'adobe:photoshop';
import { batchPlayCommand, getDocumentLayerDescriptors, photoshopLayerDescriptorsToUTLayers } from '@bubblydoo/uxp-toolkit';
import { useOnDocumentEdited, useOnDocumentLayersEdited } from '@bubblydoo/uxp-toolkit-react';
import { createGetDocumentCommand } from '@bubblydoo/uxp-toolkit/commands';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useIsAnyPluginPanelVisible } from './useIsPluginVisible';

export const documentQueries = createQueryKeys('document', {
  tree: (documentId: number) => ({
    queryKey: [documentId, 'tree'],
    queryFn: async () => {
      const layerDescriptors = await getDocumentLayerDescriptors(documentId);
      return photoshopLayerDescriptorsToUTLayers(layerDescriptors);
    },
  }),
  get: (documentId: number) => ({
    queryKey: [documentId, 'get'],
    queryFn: async () => {
      const result = await batchPlayCommand(createGetDocumentCommand(documentId));
      return result;
    },
  }),
});

export function useDocumentTreeQuery<TSelect = UTLayer>(
  document: Document,
  { skip, invalidateRefetchType, select }: { skip?: boolean; invalidateRefetchType?: 'none' | 'active' | 'inactive' | 'all'; select?: (utLayers: UTLayer[]) => TSelect } = {},
) {
  const queryClient = useQueryClient();

  const isPluginVisible = useIsAnyPluginPanelVisible() ?? true;

  const enabled = !skip && isPluginVisible;

  const treeQuery = useQuery({
    ...documentQueries.tree(document.id),
    enabled,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    select,
  });

  useOnDocumentLayersEdited(
    document,
    useCallback(() => {
      queryClient.invalidateQueries({
        queryKey: documentQueries.tree(document.id).queryKey,
        refetchType: invalidateRefetchType,
      });
    }, [queryClient, invalidateRefetchType, document.id]),
  );

  return treeQuery;
}

type GetDocumentResult = UTCommandResult<ReturnType<typeof createGetDocumentCommand>>;

export function useGetDocumentQuery<TSelect = UTCommandResult<typeof createGetDocumentCommand>>(
  document: Document,
  { skip, invalidateRefetchType, select }: { skip?: boolean; invalidateRefetchType?: 'none' | 'active' | 'inactive' | 'all'; select?: (data: GetDocumentResult) => TSelect } = {},
) {
  const isPluginVisible = useIsAnyPluginPanelVisible() ?? true;

  const enabled = !skip && isPluginVisible;

  const queryClient = useQueryClient();

  const query = useQuery({
    ...documentQueries.get(document.id),
    enabled,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    select,
  });

  useOnDocumentEdited(
    document,
    useCallback(() => {
      queryClient.invalidateQueries({
        queryKey: documentQueries.get(document.id).queryKey,
        refetchType: invalidateRefetchType,
      });
    }, [queryClient, invalidateRefetchType, document.id]),
  );

  return query;
}
