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
      url: 'assets/ecoli.geojson',
      style: { color: '#FF6347', weight: 3, fillOpacity: 0 },
      name: 'Bactérie Escherichia coli',
      visible: true,
      color: '#FF6347'
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
          // Créer un LayerGroup pour contenir tous les marqueurs
          const layerGroup = L.layerGroup();

          const layer = L.geoJSON(data, {
            style: () => layerConfig.style,
            pointToLayer: (feature, latlng) => {
              const marker = L.marker(latlng);
              // Ajouter chaque marqueur au LayerGroup
              marker.addTo(layerGroup);
              return marker;
            },
            onEachFeature: (feature, layer) => {
              if (feature.properties) {
                let popupContent = `<div><h3>${layerConfig.name}</h3>`;
                for (let key in feature.properties) {
                  popupContent += `<b>${key}:</b> ${feature.properties[key]}<br>`;
                }
                popupContent += '</div>';
                layer.bindPopup(popupContent);
              }
            }
          });

          // Stocker la référence du LayerGroup (pas la couche GeoJSON)
          layerConfig.layer = layerGroup as any;

          // Ajouter à la carte si visible
          if (layerConfig.visible) {
            layerGroup.addTo(this.map);
          }

          console.log(`✅ ${layerConfig.name} chargé avec succès (${layerGroup.getLayers().length} marqueurs)`);
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
