import {
  createCommand,
  executeAsModal,
  getFlattenedLayerDescriptorsList,
  mapTree,
  photoshopLayerDescriptorsToUTLayers,
  utLayersToTree,
  type PsLayerRef,
  type Tree,
  type UTLayer,
  type UTLayerWithoutChildren,
} from "@bubblydoo/uxp-toolkit";
import {
  useActiveDocument,
  useOnDocumentEdited,
  useOnEvent,
} from "@bubblydoo/uxp-toolkit-react";
import {
  QueryClient,
  QueryClientProvider as ReactQueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  BlendIcon,
  ChevronDown,
  CornerLeftDown,
  Eye,
  EyeOff,
  FlowerIcon,
  Folder,
  Lightbulb,
} from "lucide-react";
import { app } from "photoshop";
import type { Document } from "photoshop/dom/Document";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { cn } from "./lib/cn";

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

type NodeWithExtraDataAndFiltered = NodeWithExtraData & {
  filtered: boolean;
};

function LayersPanel({ document }: { document: Document }) {
  const queryClient = useQueryClient();
  const activeDocumentId = document.id;

  const layersQuery = useQuery({
    queryKey: ["layers", activeDocumentId],
    queryFn: async () => {
      const utLayers = await photoshopLayerDescriptorsToUTLayers(
        await getFlattenedLayerDescriptorsList(activeDocumentId),
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

  const [filter, setFilter] = useState("");
  const [matchMode, setMatchMode] = useState<
    "exact" | "contains" | "endsWith" | "startsWith"
  >("contains");
  const [filterCaseSensitive, setFilterCaseSensitive] = useState(false);

  const filteredTree = useMemo(() => {
    if (!treeWithExtraData) return undefined;
    return createFilteredTree(treeWithExtraData, filter, matchMode, filterCaseSensitive);
  }, [treeWithExtraData, filter, matchMode, filterCaseSensitive]);

  const [resultsIndex, setResultsIndex] = useState(0);

  const filterResults = useMemo(() => {
    if (!filteredTree) return [];
    return getAllResults(filteredTree);
  }, [filteredTree]);
  const resultsCount = filterResults.length;

  const scrollToResult = useCallback((layerId: number) => {
    const layer = window.document.querySelector(`[data-layer-id="${layerId}"]`);
    if (layer) {
      console.log("scrollToResult", layerId);
      const bodyHeight = window.document.body.clientHeight;
      const top =
        layer.getBoundingClientRect().top + window.document.body.scrollTop;
      console.log("top", top);
      window.document.body.scrollTo(0, top - bodyHeight / 2);
    } else {
      console.log("scrollToResult not found", layerId);
    }
  }, []);

  const nextResult = useCallback(() => {
    if (!filteredTree) return;
    setResultsIndex((prev) => {
      let newIndex = prev + 1;
      if (newIndex >= resultsCount) {
        newIndex = 0;
      }
      const result = filterResults[newIndex];
      if (result) {
        scrollToResult(result.layer.id);
      }
      return newIndex;
    });
  }, [filterResults, resultsCount, scrollToResult]);

  const previousResult = useCallback(() => {
    if (!filteredTree) return;
    setResultsIndex((prev) => {
      let newIndex = prev - 1;
      if (newIndex < 0) {
        newIndex = resultsCount - 1;
      }
      const result = filterResults[newIndex];
      if (result) {
        scrollToResult(result.layer.id);
      }
      return newIndex;
    });
  }, [filterResults, scrollToResult]);

  const [filterMode, setFilterMode] = useState<"highlight" | "collapse">(
    "highlight",
  );

  if (!filteredTree) return <div>Loading...</div>;

  return (
    <>
      <div className="h-12">
        <div className="p-2 sticky top-0 left-0 right-0 bg-psBackground z-10 pr-8 border-b border-psDark">
          <div className="flex flex-row items-center">
            <input
              type="text"
              className="flex-1 mr-1"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "Enter") {
                  nextResult();
                } else if (e.key === "ArrowUp") {
                  previousResult();
                }
              }}
            />
            <div className="whitespace-nowrap mr-1">
              {resultsIndex + 1}/{resultsCount} results
            </div>
            <ButtonDiv className="border border-psDark rounded-md mr-1">
              <ArrowUp
                size={20}
                style={{ fill: "transparent", stroke: "currentColor" }}
                onClick={previousResult}
              />
            </ButtonDiv>
            <ButtonDiv className="border border-psDark rounded-md">
              <ArrowDown
                size={20}
                style={{ fill: "transparent", stroke: "currentColor" }}
                onClick={nextResult}
              />
            </ButtonDiv>
          </div>
          <div className="flex flex-row items-center">
            <div className="flex flex-row items-center mr-1">
              <input
                type="checkbox"
                checked={filterMode === "collapse"}
                onChange={(e) =>
                  setFilterMode(e.target.checked ? "collapse" : "highlight")
                }
              />
              Collapse
            </div>
            <div className="flex flex-row items-center mr-1">
              <input
                type="checkbox"
                checked={filterCaseSensitive}
                onChange={(e) => setFilterCaseSensitive(e.target.checked)}
              />
              Case Sensitive
            </div>
            <div className="flex flex-row items-center">
              <select
                value={matchMode}
                onChange={(e) =>
                  setMatchMode(
                    e.target.value as
                      | "exact"
                      | "contains"
                      | "endsWith"
                      | "startsWith",
                  )
                }
              >
                <option value="exact">Exact</option>
                <option value="contains">Contains</option>
                <option value="endsWith">Ends With</option>
                <option value="startsWith">Starts With</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <TreeNode
        tree={filteredTree}
        activeLayerRefs={activeLayerRefsQuery.data}
        filterMode={filter.length > 0 ? filterMode : "none"}
        currentResultLayer={filterResults[resultsIndex]}
      />
    </>
  );
}

function createFilteredTree(
  tree: Tree<NodeWithExtraData>,
  filter: string,
  matchMode: "exact" | "contains" | "endsWith" | "startsWith",
  filterCaseSensitive: boolean,
): Tree<NodeWithExtraDataAndFiltered> {
  return mapTree(tree, (node) => {
    const processedName = filterCaseSensitive ? node.layer.name : node.layer.name.toLowerCase(); 
    const processedFilter = filterCaseSensitive ? filter : filter.toLowerCase();
    const isFiltered =
      matchMode === "exact"
        ? processedName === processedFilter
        : matchMode === "contains"
          ? processedName.includes(processedFilter)
          : matchMode === "endsWith"
            ? processedName.endsWith(processedFilter)
            : matchMode === "startsWith"
              ? processedName.startsWith(processedFilter)
              : false;
    return {
      ...node,
      filtered: isFiltered,
    };
  });
}

function getAllResults(tree: Tree<NodeWithExtraDataAndFiltered>) {
  const results: NodeWithExtraDataAndFiltered[] = [];
  function crawl(tree: Tree<NodeWithExtraDataAndFiltered>) {
    for (const node of tree) {
      if (node.ref.filtered) {
        results.push(node.ref);
      }
      if (node.children) {
        crawl(node.children);
      }
    }
  }
  crawl(tree);
  return results;
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
  filterMode,
  currentResultLayer,
}: {
  tree: Tree<NodeWithExtraDataAndFiltered>;
  depth?: number;
  activeLayerRefs: PsLayerRef[] | undefined;
  filterMode: "collapse" | "highlight" | "none";
  currentResultLayer: NodeWithExtraDataAndFiltered | undefined;
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

  function isNonDefaultBlendMode(ref: NodeWithExtraData) {
    if (ref.layer.kind === "group") {
      return ref.layer.blendMode !== "passThrough";
    }
    return ref.layer.blendMode !== "normal";
  }

  // const collapse = !node.ref.filtered && filterMode === "collapse";
  function shouldCollapse(node: NodeWithExtraDataAndFiltered) {
    return !node.filtered && filterMode === "collapse";
  }

  function shouldHighlight(node: NodeWithExtraDataAndFiltered) {
    return node.filtered && filterMode === "highlight";
  }

  function shouldCurrentHighlight(node: NodeWithExtraDataAndFiltered) {
    return (
      currentResultLayer?.layer.id === node.layer.id && filterMode !== "none"
    );
  }

  return (
    <>
      {tree.map((node, idx) => (
        <Fragment key={idx}>
          <div
            key={idx}
            data-layer-id={node.ref.layer.id}
            className={cn(
              "border-b border-psDark bg-psNeutral hover:bg-psHover flex flex-row items-stretch h-6",
              isActiveLayer(node.ref) && "bg-psActive hover:bg-psActive",
              shouldCollapse(node.ref) && "h-auto",
              shouldHighlight(node.ref) && "bg-[#9a916c]",
              shouldCurrentHighlight(node.ref) && "bg-[#b3a052]",
            )}
          >
            {!shouldCollapse(node.ref) ? (
              <>
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
                {/* {node.ref.filtered ? "f" : "n"} */}
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
                      className={cn(
                        node.ref.isClipped && "border-b border-white",
                      )}
                    >
                      {node.name}
                    </span>
                  </div>
                  {isNonDefaultBlendMode(node.ref) && (
                    <div className="ml-2 flex items-center">
                      <BlendIcon
                        size={14}
                        style={{ fill: "transparent", stroke: "currentColor" }}
                      />
                      <span className="text-xs ml-1">
                        {node.ref.layer.blendMode}
                      </span>
                    </div>
                  )}
                  {node.ref.layer.opacity < 255 && (
                    <div className="ml-2 flex items-center">
                      <Lightbulb
                        size={14}
                        style={{ fill: "transparent", stroke: "currentColor" }}
                      />
                      <span className="text-xs ml-1">
                        {Math.round(node.ref.layer.opacity / 2.55)}%
                      </span>
                    </div>
                  )}
                  {Object.keys(node.ref.layer.effects).length > 0 && (
                    <div className="ml-2 flex items-center">
                      <FlowerIcon
                        size={14}
                        style={{ fill: "transparent", stroke: "currentColor" }}
                      />
                    </div>
                  )}
                </ButtonDiv>
              </>
            ) : (
              <>
                <div className="border-r border-psDark w-[24px]"></div>
                <div
                  className="flex-1 flex items-center pr-2 py-[1px]"
                  style={{ marginLeft: `${depth * 8 + 6}px` }}
                >
                  <div className="h-[1px] w-5 bg-white"></div>
                </div>
              </>
            )}
          </div>
          {node.children && (
            <TreeNode
              tree={node.children}
              depth={depth + 1}
              activeLayerRefs={activeLayerRefs}
              filterMode={filterMode}
              currentResultLayer={currentResultLayer}
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
