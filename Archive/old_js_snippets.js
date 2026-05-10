
function buildPolygonFAKE(index) {
    const row = Math.floor(index / COLS);
    const col = index % COLS;
    const top = ORIGIN_LAT - row * CELL_H;
    const bottom = top - CELL_H + 0.001;       // slight gap for border visibility
    const left = ORIGIN_LON + col * CELL_W;
    const right = left + CELL_W - 0.001;
    return {
        type: 'Polygon',
        coordinates: [[
            [left, top],
            [right, top],
            [right, bottom],
            [left, bottom],
            [left, top],
        ]],
    };
}