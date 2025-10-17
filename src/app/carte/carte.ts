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
    // Initialiser la carte centrée sur la France
    this.map = L.map('map').setView([46.603354, 1.888334], 6);

    // Ajouter le fond de carte OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Marqueur sur Paris
    const parisMarker = L.marker([48.8566, 2.3522]).addTo(this.map);
    parisMarker.bindPopup('<b>Paris</b><br>Capitale de la France').openPopup();

    // Cercle sur Lyon
    const lyonCircle = L.circle([45.764043, 4.835659], {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: 50000
    }).addTo(this.map);
    lyonCircle.bindPopup('<b>Lyon</b><br>Deuxième ville de France');

    // Marqueur sur Brest
    const brestMarker = L.marker([48.390394, -4.486076]).addTo(this.map);
    brestMarker.bindPopup('<b>Brest</b><br>Bretagne');

    // Marqueur sur Marseille
    const marseilleMarker = L.marker([43.296482, 5.36978]).addTo(this.map);
    marseilleMarker.bindPopup('<b>Marseille</b><br>Ville portuaire');
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
