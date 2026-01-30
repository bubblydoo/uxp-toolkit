import {
  createCommand,
  executeAsModal,
  utLayersToTree,
  type PsLayerRef,
  type Tree,
  type UTLayerWithoutChildren,
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
import {
  ChevronDown,
  CornerLeftDown,
  Eye,
  EyeOff,
  FlowerIcon,
  Folder,
  LockIcon,
} from "lucide-react";
import { app } from "photoshop";
import type { Document } from "photoshop/dom/Document";
import { Fragment, useMemo, useState } from "react";
import { z } from "zod";
import { cn } from "./lib/cn";
import { getDocumentLayerDescriptors } from "../../uxp-toolkit/src/ut-tree/getLayerProperties";
import { photoshopLayerDescriptorsToUTLayers } from "../../uxp-toolkit/src/ut-tree/photoshopLayerDescriptorsToUTLayers";

export function App() {
  return (
    <QueryClientProvider>
      <Router />
    </QueryClientProvider>
  );
}

function Router() {
  const activeDocument = useActiveDocument();

  if (!activeDocument) return <div>No active document</div>;

  return <LayersPanel document={activeDocument} />;
}

function QueryClientProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ReactQueryClientProvider client={queryClient}>
      {children}
    </ReactQueryClientProvider>
  );
}

type NodeWithExtraData = {
  layer: UTLayerWithoutChildren;
  isClipped: boolean;
};

function LayersPanel({ document }: { document: Document }) {
  const queryClient = useQueryClient();
  const activeDocumentId = document.id;

  const layersQuery = useQuery({
    queryKey: ["layers", activeDocumentId],
    queryFn: async () => {
      const utLayers = photoshopLayerDescriptorsToUTLayers(
        await getDocumentLayerDescriptors(activeDocumentId),
      );

      return utLayersToTree(utLayers);
    },
  });

  const treeWithExtraData = useMemo(() => {
    if (!layersQuery.data) return undefined;

    function crawl(tree: Tree<UTLayerWithoutChildren>) {
      const newTree: Tree<NodeWithExtraData> = [];
      for (let i = 0; i < tree.length; i++) {
        const prevNode = i > 0 ? tree[i - 1] : null;
        const node = tree[i]!;
        const isClipped = prevNode?.ref.isClippingMask ?? false;
        newTree.push({
          ref: {
            layer: node.ref,
            isClipped,
          },
          name: node.name,
          children: node.children ? crawl(node.children) : undefined,
        });
      }
      return newTree;
    }

    return crawl(layersQuery.data);
  }, [layersQuery.data]);

  const activeLayerRefsQuery = useQuery({
    queryKey: ["activeLayers", activeDocumentId],
    queryFn: async (): Promise<PsLayerRef[]> => {
      // return [];
      const doc = app.documents.find((d) => d.id === activeDocumentId);
      if (!doc)
        throw new Error(`Document with id ${activeDocumentId} not found`);
      return doc.activeLayers.map((l) => ({
        id: l.id,
        docId: l._docId,
      }));
    },
  });

  useOnDocumentEdited(document, () => {
    queryClient.invalidateQueries({ queryKey: ["layers", activeDocumentId] });
    queryClient.invalidateQueries({
      queryKey: ["activeLayers", activeDocumentId],
    });
  });

  if (!treeWithExtraData) return <div>Loading...</div>;

  return (
    <TreeNode
      tree={treeWithExtraData}
      activeLayerRefs={activeLayerRefsQuery.data}
    />
  );
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
  activeLayerRefs,
}: {
  tree: Tree<NodeWithExtraData>;
  depth?: number;
  activeLayerRefs: PsLayerRef[] | undefined;
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
      queryClient.invalidateQueries({ queryKey: ["activeLayers", docId] });
    },
  });

  const selectLayerMutation = useMutation({
    mutationFn: async (options: { layerRef: PsLayerRef }) => {
      await executeAsModal("Select Layer", async (ctx) => {
        await ctx.batchPlayCommand(
          createCommand({
            modifying: true,
            descriptor: {
              _obj: "select",
              _target: [
                { _ref: "layer", _id: options.layerRef.id },
                { _ref: "document", _id: options.layerRef.docId },
              ],
            },
            schema: z.unknown(),
          }),
        );
      });
    },
    onSuccess: (_data, variables) => {
      const docId = variables.layerRef.docId;
      queryClient.invalidateQueries({ queryKey: ["activeLayers", docId] });
    },
  });

  function isActiveLayer(ref: NodeWithExtraData) {
    return activeLayerRefs?.some(
      (l) => l.id === ref.layer.id && l.docId === ref.layer.docId,
    );
  }

  return (
    <>
      {tree.map((node, idx) => (
        <Fragment key={idx}>
          <div
            key={idx}
            className={cn(
              "border-b border-psDark bg-psNeutral hover:bg-psHover flex flex-row items-stretch h-6",
              isActiveLayer(node.ref) && "bg-psActive hover:bg-psActive",
            )}
          >
            <div
              className="w-6 border-r border-psDark flex items-center justify-center disabled:opacity-50"
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
            <ButtonDiv
              onClick={() => {
                selectLayerMutation.mutate({
                  layerRef: {
                    id: node.ref.layer.id,
                    docId: node.ref.layer.docId,
                  },
                });
              }}
              className="flex-1 flex items-center pr-2"
              style={{ marginLeft: `${depth * 8 + 6}px` }}
            >
              {node.ref.layer.isClippingMask && (
                <div className="mr-2 ml-1 flex items-center">
                  <CornerLeftDown
                    size={14}
                    style={{ fill: "transparent", stroke: "currentColor" }}
                  />
                </div>
              )}
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
              <div className={cn("flex-1 flex items-center")}>
                <span
                  className={cn(node.ref.isClipped && "border-b border-white")}
                >
                  {node.name}
                </span>
              </div>
              {Object.keys(node.ref.layer.effects).length > 0 && (
                <div className="ml-2 flex items-center">
                  <FlowerIcon
                    size={14}
                    style={{ fill: "transparent", stroke: "currentColor" }}
                  />
                </div>
              )}
              {node.ref.layer.background && (
                <div className="ml-2 flex items-center">
                  <LockIcon
                    size={14}
                    style={{ fill: "transparent", stroke: "currentColor" }}
                  />
                </div>
              )}
            </ButtonDiv>
          </div>
          {node.children && (
            <TreeNode
              tree={node.children}
              depth={depth + 1}
              activeLayerRefs={activeLayerRefs}
            />
          )}
        </Fragment>
      ))}
    </>
  );
}

function ButtonDiv(props: React.ButtonHTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("cursor-pointer", props.className)} />;
}
