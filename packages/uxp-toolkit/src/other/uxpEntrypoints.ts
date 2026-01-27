import { z } from "zod";

export const uxpEntrypointsSchema = z.object({
  _pluginInfo: z.object({
    id: z.string(),
    name: z.string(),
    version: z.string(),
  }),
});