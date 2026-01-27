import { useQuery } from "@tanstack/react-query";
import { entrypoints } from "uxp";
import { z } from "zod";
import { photoshopGetApplicationInfo } from "@bubblydoo/uxp-toolkit";

const pluginInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
});

const pluginInfo = pluginInfoSchema.parse(
  (entrypoints as unknown as { _pluginInfo: unknown })._pluginInfo
);

export function useApplicationInfoQuery(refetchInterval: number = 1000) {
  return useQuery({
    queryKey: ["application-info"],
    queryFn: async () => {
      const appInfo = await photoshopGetApplicationInfo();
      return appInfo;
    },
    refetchInterval,
  });
}

export function useIsPluginPanelVisible(panelId: string) {
  const appInfoQuery = useApplicationInfoQuery(1000);

  if (!appInfoQuery.data) return null;

  const pluginPanel = appInfoQuery.data.panelList.find((panel) => {
    const idParts = panel.ID.split("/");
    return idParts.includes(pluginInfo.id) && idParts.includes(panelId);
  });

  if (!pluginPanel) return false;

  return pluginPanel.visible;
}

export function useIsAnyPluginPanelVisible() {
  const appInfoQuery = useApplicationInfoQuery(1000);

  if (!appInfoQuery.data) return null;

  const pluginPanel = appInfoQuery.data.panelList.find((panel) => {
    const idParts = panel.ID.split("/");
    return idParts.includes(pluginInfo.id);
  });

  if (!pluginPanel) return false;

  return pluginPanel.visible;
}