export type PsLayerData = (
  | {
      type: "text";
    }
  | {
      type: "smartObject";
    }
  | {
      type: "pixel";
    }
  | {
      type: "group";
    }
  | {
      type: "shape";
    }
  | {
      type: "adjustment-layer";
      clipping: boolean;
    }
  | {
      type: "mask";
    }
) & {
  effects: {
    [effect: string]: boolean;
  };
  blendMode: string;
};