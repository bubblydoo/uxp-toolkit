import { photoshopGetApplicationInfo, uxpEntrypointsSchema } from '@bubblydoo/uxp-toolkit';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useQuery } from '@tanstack/react-query';
import { entrypoints } from 'adobe:uxp';

const applicationQueries = createQueryKeys('application', {
  info: () => ({
    queryKey: ['info'],
    queryFn: async () => {
      const appInfo = await photoshopGetApplicationInfo();
      return appInfo;
    },
  }),
});

const pluginInfo = uxpEntrypointsSchema.parse(entrypoints)._pluginInfo;

export function useApplicationInfoQuery({ refetchInterval }: { refetchInterval?: number } = {}) {
  return useQuery({
    ...applicationQueries.info(),
    refetchInterval: refetchInterval ?? 1000,
  });
}

export function useIsPluginPanelVisible(panelId: string) {
  const appInfoQuery = useApplicationInfoQuery({ refetchInterval: 1000 });

  if (!appInfoQuery.data)
    return null;

  const pluginPanel = appInfoQuery.data.panelList.find((panel) => {
    const idParts = panel.ID.split('/');
    return idParts.includes(pluginInfo.id) && idParts.includes(panelId);
  });

  if (!pluginPanel)
    return false;

  return pluginPanel.visible;
}

export function useIsAnyPluginPanelVisible() {
  const appInfoQuery = useApplicationInfoQuery({ refetchInterval: 1000 });

  if (!appInfoQuery.data)
    return null;

  const pluginPanel = appInfoQuery.data.panelList.find((panel) => {
    const idParts = panel.ID.split('/');
    return idParts.includes(pluginInfo.id);
  });

  if (!pluginPanel)
    return false;

  return pluginPanel.visible;
}
