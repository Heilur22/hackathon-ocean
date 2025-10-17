import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-carte',
  standalone: true,
  templateUrl: 'carte.html',
  styleUrl: './carte.css'
})
export class CarteComponent implements OnInit {
  private map: any;

  ngOnInit(): void {
    // Petit délai pour s'assurer que le DOM est prêt
    setTimeout(() => {
      this.initMap();
      this.fixLeafletIcons();
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

    // Marqueur sur Roscoff
    const roscoffMarker = L.marker([48.7267, -3.9883]).addTo(this.map);
    roscoffMarker.bindPopup('<b>Roscoff</b><br>Port de Bretagne').openPopup();

    // Marqueur sur Locquirec
    const locquirecMarker = L.marker([48.6869, -3.6469]).addTo(this.map);
    locquirecMarker.bindPopup('<b>Locquirec</b><br>Station balnéaire');

    // Marqueur sur Saint-Pol-de-Léon (entre les deux)
    const stPolMarker = L.marker([48.6833, -3.9833]).addTo(this.map);
    stPolMarker.bindPopup('<b>Saint-Pol-de-Léon</b><br>Ville légumière');

    // Marqueur sur Morlaix
    const morlaixMarker = L.marker([48.5777, -3.8275]).addTo(this.map);
    morlaixMarker.bindPopup('<b>Morlaix</b><br>Ville portuaire');
  }

  // Fix pour les icônes Leaflet dans Angular
  private fixLeafletIcons(): void {
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
