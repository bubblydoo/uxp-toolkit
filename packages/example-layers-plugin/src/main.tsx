import {
  createCommand,
  executeAsModal,
  flattenTree,
  getFlattenedLayerDescriptorsList,
  photoshopLayerDescriptorsToTree,
  type PsLayerRef,
  type PsTreeNode,
  type Tree,
} from "@bubblydoo/uxp-toolkit";
import {
  useActiveDocument,
  useOnDocumentEdited,
} from "@bubblydoo/uxp-toolkit-react";
import {
  QueryClient,
  QueryClientProvider as ReactQueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ChevronDown, Eye, EyeOff, Folder } from "lucide-react";
import { app } from "photoshop";
import { Fragment, useState } from "react";
import { z } from "zod";
import { cn } from "./lib/cn";

export function App() {
  return (
    <QueryClientProvider>
      <LayersPanel />
    </QueryClientProvider>
  );
}

function QueryClientProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ReactQueryClientProvider client={queryClient}>
      {children}
    </ReactQueryClientProvider>
  );
}

function LayersPanel() {
  const activeDocument = useActiveDocument();
  const queryClient = useQueryClient();
  const activeDocumentId = activeDocument.id;

  const layersQuery = useQuery({
    queryKey: ["layers", activeDocumentId],
    queryFn: async () => {
      const tree = await photoshopLayerDescriptorsToTree(
        await getFlattenedLayerDescriptorsList(activeDocumentId),
      );

      return tree;
    },
  });

  useOnDocumentEdited(activeDocument, () => {
    queryClient.invalidateQueries({ queryKey: ["layers", activeDocumentId] });
  });

  if (!layersQuery.data) return <div>Loading...</div>;

  return <TreeNode tree={layersQuery.data} />;
}

function createSetLayerVisibilityCommand(
  layerRef: PsLayerRef,
  visible: boolean,
) {
  return createCommand({
    modifying: true,
    descriptor: {
      _obj: visible ? "show" : "hide",
      _target: [
        { _ref: "layer", _id: layerRef.id },
        { _ref: "document", _id: layerRef.docId },
      ],
    },
    schema: z.unknown(),
  });
}

function TreeNode({
  tree,
  depth = 0,
}: {
  tree: Tree<PsTreeNode>;
  depth?: number;
}) {
  const queryClient = useQueryClient();

  const changeLayerVisibilityMutation = useMutation({
    mutationFn: async (options: { layerRef: PsLayerRef; visible: boolean }) => {
      await executeAsModal("Change Layer Visibility", async (ctx) => {
        await ctx.batchPlayCommand(
          createSetLayerVisibilityCommand(options.layerRef, options.visible),
        );
      });
    },
    onSuccess: (_data, variables) => {
      const docId = variables.layerRef.docId;
      queryClient.invalidateQueries({ queryKey: ["layers", docId] });
    },
  });

  return (
    <>
      {tree.map((node, idx) => (
        <Fragment key={idx}>
          <div
            key={idx}
            className="border-b border-gray-900 bg-gray-700 flex flex-row items-stretch h-6"
          >
            <div
              className="w-6 border-r border-gray-900 flex items-center justify-center disabled:opacity-50"
              onClick={() =>
                changeLayerVisibilityMutation.mutate({
                  layerRef: {
                    id: node.ref.layer.id,
                    docId: node.ref.layer.docId,
                  },
                  visible: !node.ref.layer.visible,
                })
              }
            >
              <ButtonDiv className="text-white">
                {node.ref.layer.visible ? (
                  <Eye
                    size={14}
                    style={{ fill: "transparent", stroke: "currentColor" }}
                  />
                ) : (
                  <EyeOff
                    size={14}
                    style={{ fill: "transparent", stroke: "currentColor" }}
                  />
                )}
              </ButtonDiv>
            </div>
            <div
              className="flex-1 flex items-center"
              style={{ marginLeft: `${depth * 8 + 6}px` }}
            >
              {node.ref.layer.kind === "group" && (
                <div className="mr-2 flex items-center">
                  <ChevronDown
                    size={14}
                    style={{ fill: "transparent", stroke: "currentColor" }}
                    className="mr-[2px] ml-[-2px]"
                  />
                  <Folder
                    size={14}
                    style={{ fill: "transparent", stroke: "currentColor" }}
                  />
                </div>
              )}
              {node.name}
            </div>
          </div>
          {node.children && <TreeNode tree={node.children} depth={depth + 1} />}
        </Fragment>
      ))}
    </>
  );
}

function ButtonDiv(props: React.ButtonHTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("cursor-pointer", props.className)} />;
}
