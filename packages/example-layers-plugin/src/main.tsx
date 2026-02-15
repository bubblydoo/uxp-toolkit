import type { PsLayerRef, Tree, UTLayer, UTLayerWithoutChildren } from '@bubblydoo/uxp-toolkit';
import type { Document } from 'photoshop';
import { createCommand, executeAsModal, mapTree, utLayersToTree } from '@bubblydoo/uxp-toolkit';
import {
  documentQueries,
  useActiveDocument,
  useDocumentGetQuery,
  useDocumentTreeQuery,
  useOnDocumentEdited,
} from '@bubblydoo/uxp-toolkit-react';
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider as ReactQueryClientProvider,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import * as icons from 'lucide-react';
import { Fragment, useCallback, useMemo, useState } from 'react';
import { z } from 'zod';
import { cn } from './lib/cn';

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
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
          mutations: {
            retry: false,
          },
        },
        queryCache: new QueryCache({
          onError: (error) => {
            console.error(error);
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            console.error(error);
          },
        }),
      }),
  );

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

  const treeQuery = useDocumentTreeQuery(document, { select: utLayersToTree });

  const treeWithExtraData = useMemo(() => {
    if (!treeQuery.data) return undefined;

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

    return crawl(treeQuery.data);
  }, [treeQuery.data]);

  const documentQuery = useDocumentGetQuery(document, {
    select(data) {
      return {
        activeLayerRefs: data.targetLayersIDs.map((id) => ({
          id: id._id,
          docId: data.documentID,
        })),
        quickMode: data.quickMask,
      };
    },
  });

  useOnDocumentEdited(document, () => {
    queryClient.invalidateQueries({
      queryKey: documentQueries.tree(activeDocumentId).queryKey,
    });
    queryClient.invalidateQueries({
      queryKey: documentQueries.get(activeDocumentId).queryKey,
    });
  });

  const [filter, setFilter] = useState('');
  const [matchMode, setMatchMode] = useState<
    'exact' | 'contains' | 'endsWith' | 'startsWith'
  >('contains');
  const [filterCaseSensitive, setFilterCaseSensitive] = useState(false);
  const [filterOnlyModifiers, setFilterOnlyModifiers] = useState(false);

  const filteredTree = useMemo(() => {
    if (!treeWithExtraData) return undefined;
    return createFilteredTree(
      treeWithExtraData,
      filter,
      matchMode,
      filterCaseSensitive,
      filterOnlyModifiers,
    );
  }, [treeWithExtraData, filter, matchMode, filterCaseSensitive, filterOnlyModifiers]);

  const [resultsIndex, setResultsIndex] = useState(0);

  const filterResults = useMemo(() => {
    if (!filteredTree) return [];
    return getAllResults(filteredTree);
  }, [filteredTree]);
  const resultsCount = filterResults.length;

  const scrollToResult = useCallback((layerId: number) => {
    const layer = window.document.querySelector(`[data-layer-id="${layerId}"]`);
    if (layer) {
      const bodyHeight = window.document.body.clientHeight;
      const top =
        layer.getBoundingClientRect().top + window.document.body.scrollTop;
      window.document.body.scrollTo(0, top - bodyHeight / 2);
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
    'highlight',
  );

  if (treeQuery.error) {
    return (
      <div>
        Error:
        <div>{treeQuery.error.message}</div>
        <ButtonDiv onMouseDown={() => treeQuery.refetch()}>Retry</ButtonDiv>
      </div>
    );
  }

  if (!filteredTree) return <div>Loading...</div>;

  return (
    <>
      <div className="h-[70px]">
        <div className="p-2 fixed top-0 left-0 right-0 bg-psBackground z-10 pr-8 border-b border-psDark">
          <div className="flex flex-row items-center">
            <input
              type="text"
              className="flex-1 mr-1"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown' || e.key === 'Enter') {
                  nextResult();
                } else if (e.key === 'ArrowUp') {
                  previousResult();
                }
              }}
            />
            <div className="whitespace-nowrap mr-1">
              {resultsIndex + 1}/{resultsCount} results
            </div>
            <ButtonDiv className="border border-psDark rounded-md mr-1">
              <icons.ArrowUp
                size={20}
                style={{ fill: "transparent", stroke: "currentColor" }}
                onMouseDown={previousResult}
              />
            </ButtonDiv>
            <ButtonDiv className="border border-psDark rounded-md">
              <icons.ArrowDown
                size={20}
                style={{ fill: "transparent", stroke: "currentColor" }}
                onMouseDown={nextResult}
              />
            </ButtonDiv>
          </div>
          <div className="flex flex-row items-center">
            <div className="flex flex-row items-center mr-1">
              <input
                type="checkbox"
                checked={filterMode === "collapse"}
                onChange={(e) =>
                  setFilterMode(e.target.checked ? 'collapse' : 'highlight')
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
            <div className="flex flex-row items-center mr-1">
              <select
                value={matchMode}
                onChange={(e) =>
                  setMatchMode(
                    e.target.value as
                      | 'exact'
                      | 'contains'
                      | 'endsWith'
                      | 'startsWith',
                  )
                }
              >
                <option value="exact">Exact</option>
                <option value="contains">Contains</option>
                <option value="endsWith">Ends With</option>
                <option value="startsWith">Starts With</option>
              </select>
            </div>
            <div className="flex flex-row items-center mr-1">
              <input
                type="checkbox"
                checked={filterOnlyModifiers}
                onChange={(e) => setFilterOnlyModifiers(e.target.checked)}
              />
              Only Modifiers
            </div>
          </div>
        </div>
      </div>
      <TreeNode
        tree={filteredTree}
        activeLayerRefs={documentQuery.data?.activeLayerRefs ?? null}
        quickMode={documentQuery.data?.quickMode ?? null}
        filterMode={filter.length > 0 || filterOnlyModifiers ? filterMode : 'none'}
        currentResultLayer={filterResults[resultsIndex]}
      />
    </>
  );
}

function createFilteredTree(
  tree: Tree<NodeWithExtraData>,
  filter: string,
  filterMatchMode: 'exact' | 'contains' | 'endsWith' | 'startsWith',
  filterCaseSensitive: boolean,
  filterOnlyModifiers: boolean,
): Tree<NodeWithExtraDataAndFiltered> {
  return mapTree(tree, (node) => {
    const processedName = filterCaseSensitive
      ? node.layer.name
      : node.layer.name.toLowerCase();
    const processedFilter = filterCaseSensitive ? filter : filter.toLowerCase();
    const doesNameMatch =
      !filter ||
      (filterMatchMode === 'exact'
        ? processedName === processedFilter
        : filterMatchMode === 'contains'
          ? processedName.includes(processedFilter)
          : filterMatchMode === 'endsWith'
            ? processedName.endsWith(processedFilter)
            : filterMatchMode === 'startsWith'
              ? processedName.startsWith(processedFilter)
              : false);
    const isSpecialBlendMode =
      node.layer.kind === 'group'
        ? node.layer.blendMode !== 'passThrough'
        : node.layer.blendMode !== 'normal';
    const doModifiersMatch =
      !filterOnlyModifiers ||
      (typeof node.layer.opacity === 'number' && node.layer.opacity < 255) ||
      Object.keys(node.layer.effects).length > 0 ||
      isSpecialBlendMode;
    return {
      ...node,
      filtered: doesNameMatch && doModifiersMatch,
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

const layerIcons: Record<UTLayer['kind'], React.ReactNode> = {
  adjustmentLayer: <icons.Eclipse />,
  curves: <icons.Eclipse />,
  gradientFill: <icons.Eclipse />,
  pattern: <icons.Eclipse />,
  solidColor: <icons.Eclipse />,
  smartObject: <icons.FileScan />,
  threeD: <icons.Box />,
  video: <icons.Video />,
  text: <icons.Type />,
  background: null,
  pixel: null,
  group: null,
};

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
  quickMode,
  filterMode,
  currentResultLayer,
}: {
  tree: Tree<NodeWithExtraDataAndFiltered>;
  depth?: number;
  activeLayerRefs: PsLayerRef[] | null;
  quickMode: boolean | null;
  filterMode: 'collapse' | 'highlight' | 'none';
  currentResultLayer: NodeWithExtraDataAndFiltered | undefined;
}) {
  const queryClient = useQueryClient();

  const changeLayerVisibilityMutation = useMutation({
    mutationFn: async (options: { layerRef: PsLayerRef; visible: boolean }) => {
      await executeAsModal('Change Layer Visibility', async (ctx) => {
        await ctx.batchPlayCommand(
          createSetLayerVisibilityCommand(options.layerRef, options.visible),
        );
      });
    },
    onSuccess: (_data, variables) => {
      const docId = variables.layerRef.docId;
      queryClient.invalidateQueries({
        queryKey: documentQueries.tree(docId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: documentQueries.get(docId).queryKey,
      });
    },
  });

  const selectLayerMutation = useMutation({
    mutationFn: async (options: { layerRef: PsLayerRef }) => {
      await executeAsModal('Select Layer', async (ctx) => {
        await ctx.batchPlayCommand(
          createCommand({
            modifying: true,
            descriptor: {
              _obj: 'select',
              _target: [
                { _ref: 'layer', _id: options.layerRef.id },
                { _ref: 'document', _id: options.layerRef.docId },
              ],
            },
            schema: z.unknown(),
          }),
        );
      });
    },
    onSuccess: (_data, variables) => {
      const docId = variables.layerRef.docId;
      queryClient.invalidateQueries({
        queryKey: documentQueries.get(docId).queryKey,
      });
    },
  });

  function isActiveLayer(ref: NodeWithExtraData) {
    return activeLayerRefs?.some(
      (l) => l.id === ref.layer.id && l.docId === ref.layer.docId,
    );
  }

  function isNonDefaultBlendMode(ref: NodeWithExtraData) {
    if (ref.layer.kind === 'group') {
      return ref.layer.blendMode !== 'passThrough';
    }
    return ref.layer.blendMode !== 'normal';
  }

  function getLayerLock(ref: NodeWithExtraData) {
    return ref.layer.background || ref.layer.lock?.all
      ? 'full'
      : ref.layer.lock
        ? 'partial'
        : 'none';
  }

  function shouldCollapse(node: NodeWithExtraDataAndFiltered) {
    return !node.filtered && filterMode === 'collapse';
  }

  function shouldHighlight(node: NodeWithExtraDataAndFiltered) {
    return node.filtered && filterMode === 'highlight';
  }

  function shouldCurrentHighlight(node: NodeWithExtraDataAndFiltered) {
    return (
      currentResultLayer?.layer.id === node.layer.id && filterMode !== 'none'
    );
  }

  return (
    <>
      {tree.map((node) => {
        const lock = getLayerLock(node.ref);
        const isActive = isActiveLayer(node.ref);

        return (
          <Fragment key={node.ref.layer.id}>
          <div
            data-layer-id={node.ref.layer.id}
            className={cn(
              'border-b border-psDark bg-psNeutral hover:bg-psHover flex flex-row items-stretch h-6',
              isActive && 'bg-psActive hover:bg-psActive',
              isActive && quickMode && 'bg-[#8e615d] hover:bg-[#8e615d]',
              shouldCollapse(node.ref) && 'h-auto',
              shouldHighlight(node.ref) && 'bg-[#9a916c]',
              shouldCurrentHighlight(node.ref) && 'bg-[#b3a052]',
            )}
          >
            {!shouldCollapse(node.ref) ? (
              <>
                <div
                  className="w-6 border-r border-psDark flex items-center justify-center disabled:opacity-50"
                  onMouseDown={() =>
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
                      <icons.Eye
                        size={14}
                        style={{ fill: 'transparent', stroke: 'currentColor' }}
                      />
                    ) : (
                      <icons.EyeOff
                        size={14}
                        style={{ fill: 'transparent', stroke: 'currentColor' }}
                      />
                    )}
                  </ButtonDiv>
                </div>
                <ButtonDiv
                  onMouseDown={() => {
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
                      <icons.CornerLeftDown
                        size={14}
                        style={{ fill: 'transparent', stroke: 'currentColor' }}
                      />
                    </div>
                  )}
                  {node.ref.layer.kind === 'group' && (
                    <div className="mr-2 flex items-center">
                      <icons.ChevronDown
                        size={14}
                        style={{ fill: 'transparent', stroke: 'currentColor' }}
                        className="mr-[2px] ml-[-2px]"
                      />
                      <icons.Folder
                        size={14}
                        style={{ fill: 'transparent', stroke: 'currentColor' }}
                      />
                    </div>
                  )}
                  {layerIcons[node.ref.layer.kind] && (
                    <span className="mr-1">{layerIcons[node.ref.layer.kind]}</span>
                  )}
                  <div className={cn('flex-1 flex items-center')}>
                    <span
                      className={cn(
                        node.ref.isClipped && 'border-b border-white',
                      )}
                    >
                      {node.name}
                    </span>
                    {node.ref.layer.rasterMask && (
                      <span className="ml-1">
                        <icons.VenetianMask
                          style={{
                            stroke: node.ref.layer.rasterMask.enabled
                              ? undefined
                              : 'red',
                          }}
                        />
                      </span>
                    )}
                  </div>
                  {isNonDefaultBlendMode(node.ref) && (
                    <div className="ml-2 flex items-center">
                      <icons.BlendIcon
                        size={14}
                        style={{ fill: 'transparent', stroke: 'currentColor' }}
                      />
                      <span className="text-xs ml-1">
                        {node.ref.layer.blendMode}
                      </span>
                    </div>
                  )}
                  {typeof node.ref.layer.opacity === 'number' &&
                    node.ref.layer.opacity < 255 && (
                    <div className="ml-2 flex items-center">
                      <icons.Lightbulb
                        size={14}
                        style={{ fill: 'transparent', stroke: 'currentColor' }}
                      />
                      <span className="text-xs ml-1">
                        {Math.round(node.ref.layer.opacity / 2.55)}%
                      </span>
                    </div>
                  )}
                  {!!node.ref.layer.linkedLayerIds?.length && (
                    <div className="ml-2 flex items-center">
                      <icons.Link />
                    </div>
                  )}
                  {lock !== 'none' && (
                    <div className="ml-2 flex items-center">
                      {lock === 'full' ? (
                        <icons.LockKeyhole />
                      ) : (
                        <icons.LockKeyholeOpen />
                      )}
                    </div>
                  )}
                  {Object.keys(node.ref.layer.effects).length > 0 && (
                    <div className="ml-2 flex items-center">
                      <icons.Flower
                        size={14}
                        style={{ fill: 'transparent', stroke: 'currentColor' }}
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
              quickMode={quickMode}
              filterMode={filterMode}
              currentResultLayer={currentResultLayer}
            />
          )}
          </Fragment>
        );
      })}
    </>
  );
}

function ButtonDiv(props: React.ButtonHTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn('cursor-pointer', props.className)} />;
}
