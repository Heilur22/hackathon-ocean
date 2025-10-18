export interface LayerConfig {
  url: string;
  style: any | ((feature: any) => any);
  name: string;
  visible: boolean;
  color: string;
  layer?: L.Layer;
  interactive?: boolean;
  useCustomMarkers?: boolean;
}
