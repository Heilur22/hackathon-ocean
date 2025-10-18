import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import {HttpClient} from '@angular/common/http';
import {LayerConfig} from './layer-config';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-carte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'carte.html',
  styleUrl: './carte.css'
})
export class CarteComponent implements OnInit {

  constructor(private http: HttpClient) {}

  private map: any;

  // Configuration des couches avec visibilité
  layers: LayerConfig[] = [
    {
      url: 'assets/pesticide_with_data.geojson',
      style: { color: '#228B22', fillOpacity: 0.3 },
      name: 'Pesticides',
      visible: true,
      color: '#228B22',
      useCustomMarkers: true
    },
    {
      url: 'assets/ecoli_with_data2.geojson',
      style: { color: '#FF6347', weight: 3, fillOpacity: 0 },
      name: 'Bactérie Escherichia coli',
      visible: true,
      color: '#FF6347',
      useCustomMarkers: true  // ⬅️ AJOUT
    },
    {
      url: 'assets/zone_morlaix.geojson',
      style: (feature: any) => {
        const classValue = feature?.properties?.CLASS_2023;
        let fillColor = '#ff0000';

        if (classValue === 'A') {
          fillColor = '#00ff00';
        } else if (classValue === 'B') {
          fillColor = '#ffff00';
        } else if (classValue === 'C') {
          fillColor = '#ffff00';
        }

        return {
          color: fillColor,
          weight: 2,
          fillColor: fillColor,
          fillOpacity: 0.5
        };
      },
      name: 'Zone baie de morlaix',
      visible: true,
      color: '#3388ff'
    },
    {
      url: 'assets/zone_locquirec.geojson',
      style: (feature: any) => {
        const classValue = feature?.properties?.GP2_2023;
        let fillColor = '#ff0000';

        if (classValue === 'A') {
          fillColor = '#00ff00';
        } else if (classValue === 'B') {
          fillColor = '#ffff00';
        } else if (classValue === 'C') {
          fillColor = '#ffff00';
        }

        return {
          color: fillColor,
          weight: 2,
          fillColor: fillColor,
          fillOpacity: 0.5
        };
      },
      name: 'Zone Locquirec',
      visible: true,
      color: '#3388ff',
    },
    {
      url: 'assets/zone_etude.geojson',
      style: (feature: any) => {
        const classValue = feature?.properties?.GP2_2023;
        let fillColor = '#ff0000';

        if (classValue === 'A') {
          fillColor = '#00ff00';
        } else if (classValue === 'B') {
          fillColor = '#ffff00';
        } else if (classValue === 'C') {
          fillColor = '#ffff00';
        }

        return {
          color: fillColor,
          weight: 2,
          fillColor: fillColor,
          fillOpacity: 0
        };
      },
      name: 'Zone d\'étude',
      visible: true,
      color: '#3388ff',
      interactive: false
    }
  ];

  activeLegends: Array<{name: string, items: Array<{color: string, label: string, range: string}>}> = [];
  showLayerControl: boolean = false;

  ngOnInit(): void {
    setTimeout(() => {
      this.fixLeafletIcons();
      this.initMap();
      this.loadGeoJSON();
      this.updateLegends();
    }, 100);
  }

  private initMap(): void {
    this.map = L.map('map');

    const roscoff: L.LatLngTuple = [48.7267, -3.9883];
    const locquirec: L.LatLngTuple = [48.6869, -3.6469];
    const bounds = L.latLngBounds(roscoff, locquirec);
    this.map.fitBounds(bounds, { padding: [50, 50] });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private loadGeoJSON(): void {
    this.layers.forEach(layerConfig => {
      this.http.get(layerConfig.url).subscribe({
        next: (data: any) => {
          const layer = L.geoJSON(data, {
            filter: (feature) => {
              if (layerConfig.url.includes('ecoli')) {
                const concentration = feature.properties?.['bacteries_Concentration_moyenne'];
                // Retourne false si la valeur est null, undefined, 0 ou vide
                return concentration != null && concentration !== '' && concentration > 0;
              }
              if (layerConfig.url.includes('pesticide')) {
                const valeur = feature.properties?.['Moyenne micropolluants OH — Feuil1_Valeur_moy'];
                // Retourne false si la valeur est null, undefined, 0 ou vide
                return valeur != null && valeur !== '' && valeur > 0;
              }
              // Pour les autres couches, on garde tous les features
              return true;
            },
            style: (feature) => {
              if (typeof layerConfig.style === 'function') {
                return layerConfig.style(feature);
              }
              return layerConfig.style as any;
            },

            pointToLayer: (feature, latlng) => {
              // Marqueurs colorés personnalisés
              if (layerConfig.useCustomMarkers) {
                let markerColor = '#00ff00'; // Vert par défaut
                let valeur = 0;

                // Logique pour les pesticides
                if (layerConfig.url.includes('pesticide')) {
                  valeur = feature.properties?.['Moyenne micropolluants OH — Feuil1_Valeur_moy'];
                  if (valeur > 0.2) {
                    markerColor = '#ff0000'; // Rouge
                  } else if (valeur > 0.05) {
                    markerColor = '#ffff00'; // Jaune
                  }
                }

                // Logique pour E. coli
                if (layerConfig.url.includes('ecoli')) {
                  valeur = feature.properties?.['bacteries_Concentration_moyenne'];
                  if (valeur > 100000) {
                    markerColor = '#8B0000'; // Rouge écarlate
                  } else if (valeur > 50000) {
                    markerColor = '#ff0000'; // Rouge
                  } else if (valeur > 5000) {
                    markerColor = '#FFA500'; // Orange
                  } else if (valeur > 500) {
                    markerColor = '#ffff00'; // Jaune
                  } else {
                    markerColor = '#00ff00'; // Vert (0-500)
                  }
                }

                const icon = L.divIcon({
                  className: 'custom-marker',
                  html: `
                    <div style="
                      background-color: ${markerColor};
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      border: 2px solid #fff;
                      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    "></div>
                  `,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10],
                  popupAnchor: [0, -10]
                });

                return L.marker(latlng, { icon });
              }

              return L.marker(latlng);
            },

            interactive: layerConfig.interactive !== false,

            onEachFeature: (feature, layer: any) => {
              if (layerConfig.interactive === false) return;

              if (feature.properties) {
                // Popup enrichie pour pesticide_with_data
                if (layerConfig.url.includes('pesticide') && layerConfig.useCustomMarkers) {
                  const valeur = feature.properties['Moyenne micropolluants OH — Feuil1_Valeur_moy'];
                  if(!valeur) {
                    return;
                  }
                  let status = 'Bon';
                  let statusColor = '#00ff00';

                  if (valeur > 0.2) {
                    status = 'Critique';
                    statusColor = '#ff0000';
                  } else if (valeur > 0.05) {
                    status = 'Attention';
                    statusColor = '#ffff00';
                  }

                  let popupContent = `
                    <div style="font-family: Arial; min-width: 200px;">
                      <h3 style="margin: 0 0 10px 0;">${layerConfig.name}</h3>
                      <div style="background: ${statusColor}; color: #000; padding: 5px 10px; border-radius: 3px; margin-bottom: 10px; font-weight: bold;">
                        ${status}: ${valeur.toFixed(3)} µg/L
                      </div>`;

                  for (let key in feature.properties) {
                    if (key !== 'Moyenne micropolluants OH — Feuil1_Valeur_moy') {
                      popupContent += `<p style="margin: 3px 0;"><b>${key}:</b> ${feature.properties[key]}</p>`;
                    }
                  }
                  popupContent += '</div>';
                  layer.bindPopup(popupContent);
                }
                // Popup enrichie pour E. coli
                else if (layerConfig.url.includes('ecoli') && layerConfig.useCustomMarkers) {
                  const valeur = feature.properties.bacteries_Concentration_moyenne;
                  let status = 'Excellente';
                  let statusColor = '#00ff00';

                  if (valeur > 100000) {
                    status = 'Très mauvaise';
                    statusColor = '#8B0000';
                  } else if (valeur > 50000) {
                    status = 'Mauvaise';
                    statusColor = '#ff0000';
                  } else if (valeur > 5000) {
                    status = 'Médiocre';
                    statusColor = '#FFA500';
                  } else if (valeur > 500) {
                    status = 'Moyenne';
                    statusColor = '#ffff00';
                  }

                  let popupContent = `
                    <div style="font-family: Arial; min-width: 200px;">
                      <h3 style="margin: 0 0 10px 0;">${layerConfig.name}</h3>
                      <div style="background: ${statusColor}; color: #000; padding: 5px 10px; border-radius: 3px; margin-bottom: 10px; font-weight: bold;">
                        ${status}: ${valeur?.toLocaleString('fr-FR')} UFC/100mL
                      </div>`;

                  for (let key in feature.properties) {
                    if (key !== 'bacteries_Concentration_moyenne') {
                      popupContent += `<p style="margin: 3px 0;"><b>${key}:</b> ${feature.properties[key]}</p>`;
                    }
                  }
                  popupContent += '</div>';
                  layer.bindPopup(popupContent);
                }
                else {
                  // Popup standard
                  let popupContent = `<div><h3>${layerConfig.name}</h3>`;
                  for (let key in feature.properties) {
                    popupContent += `<b>${key}:</b> ${feature.properties[key]}<br>`;
                  }
                  popupContent += '</div>';
                  layer.bindPopup(popupContent);
                }
              }

              if (
                (feature.geometry.type === 'Polygon' ||
                  feature.geometry.type === 'MultiPolygon')
              ) {
                const originalStyle =
                  typeof layerConfig.style === 'function'
                    ? layerConfig.style(feature)
                    : layerConfig.style;

                layer.on('mouseover', (e: any) => {
                  e.target.setStyle({
                    weight: 4,
                    fillOpacity: 0.8,
                    color: originalStyle.color,
                    fillColor: originalStyle.fillColor,
                  });
                });

                layer.on('mouseout', (e: any) => {
                  e.target.setStyle(originalStyle);
                });
              }
            },
          });

          layerConfig.layer = layer as any;

          if (layerConfig.visible) {
            layer.addTo(this.map);
          }

          console.log(`✅ ${layerConfig.name} chargé avec succès`);
        },
        error: (error) => {
          console.error(`❌ Erreur lors du chargement de ${layerConfig.name}:`, error);
        }
      });
    });
  }

  toggleLayer(layerConfig: LayerConfig): void {
    if (!layerConfig.layer) {
      console.warn(`⚠️ Couche ${layerConfig.name} pas encore chargée`);
      return;
    }

    if (layerConfig.visible) {
      this.map.addLayer(layerConfig.layer);
      console.log(`👁️ Affichage de ${layerConfig.name}`);
    } else {
      this.map.removeLayer(layerConfig.layer);
      console.log(`🚫 Masquage de ${layerConfig.name}`);
    }

    this.updateLegends(); // ⬅️ AJOUT
  }

  private fixLeafletIcons(): void {
    (L.Icon.Default as any).imagePath = 'assets/';
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  private updateLegends(): void {
    this.activeLegends = [];

    this.layers.forEach(layer => {
      if (layer.visible && layer.useCustomMarkers) {
        if (layer.url.includes('pesticide')) {
          this.activeLegends.push({
            name: 'Pesticides',
            items: [
              { color: '#00ff00', label: 'Bon', range: '≤ 0.05 µg/L' },
              { color: '#ffff00', label: 'Attention', range: '0.05 - 0.2 µg/L' },
              { color: '#ff0000', label: 'Critique', range: '> 0.2 µg/L' }
            ]
          });
        }

        if (layer.url.includes('ecoli')) {
          this.activeLegends.push({
            name: 'E. coli',
            items: [
              { color: '#00ff00', label: 'Excellente', range: '0 - 500' },
              { color: '#ffff00', label: 'Moyenne', range: '500 - 5 000' },
              { color: '#FFA500', label: 'Médiocre', range: '5 000 - 50 000' },
              { color: '#ff0000', label: 'Mauvaise', range: '50 000 - 100 000' },
              { color: '#8B0000', label: 'Très mauvaise', range: '> 100 000 UFC/100mL' }
            ]
          });
        }
      }
    });
  }

  toggleLayerControl(): void {
    this.showLayerControl = !this.showLayerControl;
  }

}
