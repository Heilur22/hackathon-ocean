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
      url: 'assets/pesticide.geojson',
      style: { color: '#228B22', fillOpacity: 0.3 },
      name: 'Pesticides',
      visible: true,
      color: '#228B22'
    },
    {
      url: 'assets/pesticide_with_data.geojson',
      style: { color: '#228B22', fillOpacity: 0.3 },
      name: 'Pesticides avec données',
      visible: true,
      color: '#228B22'
    },
    {
      url: 'assets/ecoli.geojson',
      style: { color: '#FF6347', weight: 3, fillOpacity: 0 },
      name: 'Bactérie Escherichia coli',
      visible: true,
      color: '#FF6347'
    },
    {
      url: 'assets/zone_morlaix.geojson',
      // ⬇️ CHANGEMENT ICI : fonction au lieu d'objet
      style: (feature: any) => {
        // Couleur basée sur CLASS_2023
        const classValue = feature?.properties?.CLASS_2023;
        let fillColor = '#ff0000'; // Rouge par défaut (N ou absence)

        if (classValue === 'A') {
          fillColor = '#00ff00'; // Bleu ciel
        } else if (classValue === 'B') {
          fillColor = '#ffff00'; // Vert
        } else if (classValue === 'C') {
          fillColor = '#ffff00'; // Jaune
        }

        return {
          color: fillColor,        // Couleur du contour
          weight: 2,               // Épaisseur du contour
          fillColor: fillColor,    // Couleur de remplissage
          fillOpacity: 0.5         // Opacité du remplissage
        };
      },
      name: 'Zone baie de morlaix',
      visible: true,
      color: '#3388ff'
    },
    {
      url: 'assets/zone_locquirec.geojson',
      // ⬇️ CHANGEMENT ICI : fonction au lieu d'objet
      style: (feature: any) => {
        // Couleur basée sur CLASS_2023
        const classValue = feature?.properties?.GP2_2023;
        let fillColor = '#ff0000'; // Rouge par défaut (N ou absence)

        if (classValue === 'A') {
          fillColor = '#00ff00'; // Bleu ciel
        } else if (classValue === 'B') {
          fillColor = '#ffff00'; // Vert
        } else if (classValue === 'C') {
          fillColor = '#ffff00'; // Jaune
        }

        return {
          color: fillColor,        // Couleur du contour
          weight: 2,               // Épaisseur du contour
          fillColor: fillColor,    // Couleur de remplissage
          fillOpacity: 0.5         // Opacité du remplissage
        };
      },
      name: 'Zone Locquirec',
      visible: true,
      color: '#3388ff',
    },
    {
      url: 'assets/zone_etude.geojson',
      // ⬇️ CHANGEMENT ICI : fonction au lieu d'objet
      style: (feature: any) => {
        // Couleur basée sur CLASS_2023
        const classValue = feature?.properties?.GP2_2023;
        let fillColor = '#ff0000'; // Rouge par défaut (N ou absence)

        if (classValue === 'A') {
          fillColor = '#00ff00'; // Bleu ciel
        } else if (classValue === 'B') {
          fillColor = '#ffff00'; // Vert
        } else if (classValue === 'C') {
          fillColor = '#ffff00'; // Jaune
        }

        return {
          color: fillColor,        // Couleur du contour
          weight: 2,               // Épaisseur du contour
          fillColor: fillColor,    // Couleur de remplissage
          fillOpacity: 0         // Opacité du remplissage
        };
      },
      name: 'Zone d\'étude',
      visible: true,
      color: '#3388ff',
      interactive: false
    }
  ];

  ngOnInit(): void {
    setTimeout(() => {
      this.fixLeafletIcons();
      this.initMap();
      this.loadGeoJSON();
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
          // Créer la couche GeoJSON directement
          const layer = L.geoJSON(data, {
            style: (feature) => {
              if (typeof layerConfig.style === 'function') {
                return layerConfig.style(feature);
              }
              return layerConfig.style as any;
            },
            pointToLayer: (feature, latlng) => L.marker(latlng),

            // ✅ Désactive toute interaction si demandé
            interactive: layerConfig.interactive !== false,

            onEachFeature: (feature, layer: any) => {
              // 🚫 Ne fait rien si la couche n’est pas interactive
              if (layerConfig.interactive === false) return;

              if (feature.properties) {
                // Popup standard
                let popupContent = `<div><h3>${layerConfig.name}</h3>`;
                for (let key in feature.properties) {
                  popupContent += `<b>${key}:</b> ${feature.properties[key]}<br>`;
                }
                popupContent += '</div>';
                layer.bindPopup(popupContent);
              }

              // Effet hover uniquement si interactif
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

          // Stocker la référence de la couche GeoJSON
          layerConfig.layer = layer as any;

          // Ajouter à la carte si visible
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

  // Méthode pour afficher/masquer une couche
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
}
