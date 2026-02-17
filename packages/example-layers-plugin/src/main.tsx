import type { PsLayerRef, Tree, UTLayer, UTLayerWithoutChildren } from '@bubblydoo/uxp-toolkit';
import type { Document } from 'adobe:photoshop';
import {
  createCommand,
  executeAsModal,
  utLayersToTree,
} from '@bubblydoo/uxp-toolkit';
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
import { Fragment, useMemo, useState } from 'react';
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

  if (!activeDocument)
    return <div>No active document</div>;

  return <LayersPanel document={activeDocument} />;
}

function QueryClientProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
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
  }));

  return (
    <ReactQueryClientProvider client={queryClient}>
      {children}
    </ReactQueryClientProvider>
  );
}

interface NodeWithExtraData {
  layer: UTLayerWithoutChildren;
  isClipped: boolean;
}

function LayersPanel({ document }: { document: Document }) {
  const queryClient = useQueryClient();
  const activeDocumentId = document.id;

  const treeQuery = useDocumentTreeQuery(document, { select: utLayersToTree });

  const treeWithExtraData = useMemo(() => {
    if (!treeQuery.data)
      return undefined;

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

  const documentQuery = useDocumentGetQuery(
    document,
    {
      select(data) {
        return {
          activeLayerRefs: data.targetLayersIDs.map(id => ({
            id: id._id,
            docId: data.documentID,
          })),
          quickMode: data.quickMask,
        };
      },
    },
  );

  useOnDocumentEdited(document, () => {
    queryClient.invalidateQueries({ queryKey: documentQueries.tree(activeDocumentId).queryKey });
    queryClient.invalidateQueries({ queryKey: documentQueries.get(activeDocumentId).queryKey });
  });

  if (treeQuery.error) {
    return (
      <div>
        Error:
        <div>{treeQuery.error.message}</div>
        <ButtonDiv onClick={() => treeQuery.refetch()}>
          Retry
        </ButtonDiv>
      </div>
    );
  }

  if (!treeWithExtraData)
    return <div>Loading...</div>;

  return (
    <TreeNode
      tree={treeWithExtraData}
      activeLayerRefs={documentQuery.data?.activeLayerRefs ?? null}
      quickMode={documentQuery.data?.quickMode ?? null}
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
      _obj: visible ? 'show' : 'hide',
      _target: [
        { _ref: 'layer', _id: layerRef.id },
        { _ref: 'document', _id: layerRef.docId },
      ],
    },
    schema: z.unknown(),
  });
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

function TreeNode({
  tree,
  depth = 0,
  activeLayerRefs,
  quickMode,
}: {
  tree: Tree<NodeWithExtraData>;
  depth?: number;
  activeLayerRefs: PsLayerRef[] | null;
  quickMode: boolean | null;
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
      queryClient.invalidateQueries({ queryKey: documentQueries.tree(docId).queryKey });
      queryClient.invalidateQueries({ queryKey: documentQueries.get(docId).queryKey });
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
      queryClient.invalidateQueries({ queryKey: documentQueries.get(docId).queryKey });
    },
  });

  function isActiveLayer(ref: NodeWithExtraData) {
    return activeLayerRefs?.some(
      l => l.id === ref.layer.id && l.docId === ref.layer.docId,
    );
  }

  function getLayerLock(ref: NodeWithExtraData) {
    return ref.layer.background || ref.layer.lock?.all ? 'full' : ref.layer.lock ? 'partial' : 'none';
  }

  return (
    <>
      {tree.map((node) => {
        const lock = getLayerLock(node.ref);
        const isActive = isActiveLayer(node.ref);

        return (
          <Fragment key={node.ref.layer.id}>
            <div
              className={cn(
                'border-b border-psDark bg-psNeutral hover:bg-psHover flex flex-row items-stretch h-6',
                isActive && 'bg-psActive hover:bg-psActive',
                isActive && quickMode && 'bg-[#8e615d] hover:bg-[#8e615d]',
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
                  })}
              >
                <ButtonDiv className="text-white">
                  {node.ref.layer.visible ? <icons.Eye /> : <icons.EyeOff />}
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
                    <icons.CornerLeftDown />
                  </div>
                )}
                {node.ref.layer.kind === 'group' && (
                  <div className="mr-2 flex items-center">
                    <icons.ChevronDown />
                    <icons.Folder />
                  </div>
                )}
                {layerIcons[node.ref.layer.kind] && (
                  <span className="mr-1">
                    {layerIcons[node.ref.layer.kind]}
                  </span>
                )}
                <div className={cn('flex-1 flex items-center')}>
                  <span
                    className={cn(node.ref.isClipped && 'border-b border-white')}
                  >
                    {node.name}
                  </span>
                  {node.ref.layer.rasterMask && (
                    <span className="ml-1">
                      <icons.VenetianMask style={{ stroke: node.ref.layer.rasterMask.enabled ? undefined : 'red' }} />
                    </span>
                  )}
                </div>
                {!!node.ref.layer.linkedLayerIds?.length && (
                  <div className="ml-2 flex items-center">
                    <icons.Link />
                  </div>
                )}
                {lock !== 'none' && (
                  <div className="ml-2 flex items-center">
                    {lock === 'full' ? <icons.LockKeyhole /> : <icons.LockKeyholeOpen />}
                  </div>
                )}
                {Object.keys(node.ref.layer.effects).length > 0 && (
                  <div className="ml-2 flex items-center">
                    <icons.Flower />
                  </div>
                )}
              </ButtonDiv>
            </div>
            {node.children && (
              <TreeNode
                tree={node.children}
                depth={depth + 1}
                activeLayerRefs={activeLayerRefs}
                quickMode={quickMode}
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
