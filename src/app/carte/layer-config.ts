export interface LayerConfig {
  url: string;
  style: any;
  name: string;
  visible: boolean;
  layer?: L.GeoJSON;
  color: string;
}
