import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import {HttpClient} from '@angular/common/http';
import {LayerConfig} from './layer-config';

@Component({
  selector: 'app-carte',
  standalone: true,
  templateUrl: 'carte.html',
  styleUrl: './carte.css'
})
export class CarteComponent implements OnInit {

  constructor(private http: HttpClient) {
  }
  private map: any;

  ngOnInit(): void {
    // Petit délai pour s'assurer que le DOM est prêt
    setTimeout(() => {
      this.fixLeafletIcons();
      this.initMap();
      this.loadGeoJSON();
    }, 100);
  }

  private initMap(): void {
    // Initialiser la carte
    this.map = L.map('map');

    // Définir les coordonnées de Roscoff et Locquirec
    const roscoff: L.LatLngTuple = [48.7267, -3.9883];
    const locquirec: L.LatLngTuple = [48.6869, -3.6469];

    // Zoomer sur la zone entre Roscoff et Locquirec
    const bounds = L.latLngBounds(roscoff, locquirec);
    this.map.fitBounds(bounds, { padding: [50, 50] });

    // Ajouter le fond de carte OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private loadGeoJSON(): void {
    // Liste des fichiers GeoJSON à charger
    const geoJsonFiles = [
      { url: 'assets/pesticide.geojson', style: { color: '#228B22', fillOpacity: 0.3 }, name: 'Pesticides' },
      { url: 'assets/ecoli.geojson', style: { color: '#FF6347', weight: 3, fillOpacity: 0 }, name: 'Bactérie Escherichia coli' },
    ];

    // Charger chaque fichier
    geoJsonFiles.forEach(file => {
      this.http.get(file.url).subscribe({
        next: (data: any) => {
          const layer = L.geoJSON(data, {
            style: () => file.style,
            pointToLayer: (feature, latlng) => {
              // Crée un marker classique pour chaque Point
              return L.marker(latlng);
            },
            onEachFeature: (feature, layer) => {
              if (feature.properties) {
                let popupContent = `<div><h3>${file.name}</h3>`;
                for (let key in feature.properties) {
                  popupContent += `<b>${key}:</b> ${feature.properties[key]}<br>`;
                }
                popupContent += '</div>';
                layer.bindPopup(popupContent);
              }
            }
          }).addTo(this.map);

          console.log(`✅ ${file.name} chargé avec succès`);
        },
        error: (error) => {
          console.error(`❌ Erreur lors du chargement de ${file.name}:`, error);
        }
      });
    });
  }

  toggleLayer(layerConfig: LayerConfig): void {
    if (!layerConfig.layer) return;

    if (layerConfig.visible) {
      layerConfig.layer.addTo(this.map);
    } else {
      this.map.removeLayer(layerConfig.layer);
    }
  }

  // Fix pour les icônes Leaflet dans Angular
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
