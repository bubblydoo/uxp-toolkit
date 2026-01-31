import type { UTLayer } from '@bubblydoo/uxp-toolkit';
import type { Document } from 'photoshop/dom/Document';
import { getDocumentLayerDescriptors, photoshopLayerDescriptorsToUTLayers } from '@bubblydoo/uxp-toolkit';
import { useOnDocumentLayersEdited } from '@bubblydoo/uxp-toolkit-react';
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
