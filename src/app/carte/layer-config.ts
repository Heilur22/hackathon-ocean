export interface LayerConfig {
  url: string;
  style: any | ((feature: any) => any);  // ⬅️ Peut être un objet OU une fonction
  name: string;
  visible: boolean;
  color: string;
  layer?: L.Layer;
  interactive?: boolean;
}
