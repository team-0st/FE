export type MapShopPin = {
    id: string;
    emoji: string;
    latitude: number;
    longitude: number;
};

type MapShopPinWithHtml = MapShopPin & {
    pinHtml: string;
};

function escapeForHtmlJson(value: string): string {
    return JSON.stringify(value);
}

function shopPinSvg(emoji: string, fillColor: string): string {
    const safeEmoji = emoji
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46" aria-hidden="true">' +
        `<path d="M18 1C9.16 1 2 8.16 2 17c0 11.5 16 27 16 27s16-15.5 16-27C34 8.16 26.84 1 18 1z" fill="${fillColor}" stroke="#ffffff" stroke-width="2"/>` +
        `<text x="18" y="21" text-anchor="middle" font-size="14">${safeEmoji}</text>` +
        '</svg>'
    );
}

function userPinSvg(fillColor: string): string {
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42" aria-hidden="true">' +
        `<path d="M16 1C8.82 1 3 6.82 3 14c0 9.5 13 26 13 26s13-16.5 13-26C29 6.82 23.18 1 16 1z" fill="${fillColor}" stroke="#ffffff" stroke-width="2"/>` +
        '<circle cx="16" cy="14" r="5" fill="#ffffff"/>' +
        '</svg>'
    );
}

export function buildPartnerMapHtml(
    shops: MapShopPin[],
    userLatitude?: number,
    userLongitude?: number,
    maxVisiblePins = 4,
): string {
    const shopPinColor = '#7C5CBF';
    const userPinColor = '#E53935';
    const shopsWithPins: MapShopPinWithHtml[] = shops.map((shop) => ({
        ...shop,
        pinHtml: shopPinSvg(shop.emoji, shopPinColor),
    }));
    const shopsJson = JSON.stringify(shopsWithPins);
    const userJson =
        userLatitude != null && userLongitude != null
            ? JSON.stringify({ latitude: userLatitude, longitude: userLongitude })
            : 'null';
    const userPinHtml = userPinSvg(userPinColor);

    return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
  <style>
    html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #e8eef2; }
    .pin-marker { background: transparent; border: none; }
    .leaflet-marker-pane { z-index: 650 !important; }
    .leaflet-tile-pane { z-index: 200 !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var shops = ${shopsJson};
    var user = ${userJson};
    var userPinHtml = ${escapeForHtmlJson(userPinHtml)};
    var MAX_PINS = ${maxVisiblePins};
    var markers = [];
    var map = L.map('map', { zoomControl: true, attributionControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    function distanceMeters(lat1, lng1, lat2, lng2) {
      var R = 6371000;
      var toRad = function(deg) { return deg * Math.PI / 180; };
      var dLat = toRad(lat2 - lat1);
      var dLng = toRad(lng2 - lng1);
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    function clearMarkers() {
      markers.forEach(function(marker) { map.removeLayer(marker); });
      markers = [];
    }

    function renderNearbyPins(centerLat, centerLng, shouldFitBounds) {
      clearMarkers();
      var ranked = shops
        .map(function(shop) {
          return {
            shop: shop,
            distance: distanceMeters(centerLat, centerLng, shop.latitude, shop.longitude)
          };
        })
        .sort(function(a, b) { return a.distance - b.distance; })
        .slice(0, MAX_PINS);

      var bounds = L.latLngBounds([]);
      ranked.forEach(function(entry) {
        var shop = entry.shop;
        bounds.extend([shop.latitude, shop.longitude]);
        var icon = L.divIcon({
          className: 'pin-marker',
          html: shop.pinHtml,
          iconSize: [36, 46],
          iconAnchor: [18, 46]
        });
        var marker = L.marker([shop.latitude, shop.longitude], { icon: icon, zIndexOffset: 1000 }).addTo(map);
        marker.on('click', function() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'shop', shopId: shop.id }));
          }
        });
        markers.push(marker);
      });

      if (shouldFitBounds) {
        if (user) {
          bounds.extend([user.latitude, user.longitude]);
        }
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 });
        }
      }
    }

    if (user) {
      var userIcon = L.divIcon({
        className: 'pin-marker',
        html: userPinHtml,
        iconSize: [32, 42],
        iconAnchor: [16, 42]
      });
      L.marker([user.latitude, user.longitude], { icon: userIcon, zIndexOffset: 1100 }).addTo(map);
      renderNearbyPins(user.latitude, user.longitude, true);
    } else if (shops.length > 0) {
      renderNearbyPins(shops[0].latitude, shops[0].longitude, true);
      map.setView([shops[0].latitude, shops[0].longitude], 12);
    } else {
      map.setView([37.5665, 126.978], 11);
    }

    var moveTimer = null;
    map.on('moveend', function() {
      if (moveTimer) { clearTimeout(moveTimer); }
      moveTimer = setTimeout(function() {
        var center = map.getCenter();
        renderNearbyPins(center.lat, center.lng, false);
      }, 250);
    });
  </script>
</body>
</html>`;
}
