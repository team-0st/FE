import { buildPartnerMapHtml } from './buildPartnerMapHtml';

describe('buildPartnerMapHtml', () => {
    it('embeds leaflet map with shop markers and pin limit', () => {
        const html = buildPartnerMapHtml(
            [{ id: 'almae-seongsu', emoji: '♻️', latitude: 37.5448, longitude: 127.0563 }],
            37.5446,
            127.0559,
            4,
        );
        expect(html).toContain('leaflet');
        expect(html).toContain('tile.openstreetmap.org');
        expect(html).toContain('almae-seongsu');
        expect(html).toContain('pin-marker');
        expect(html).toContain('MAX_PINS');
        expect(html).toContain('renderNearbyPins');
        expect(html).toContain('OpenStreetMap');
    });
});
