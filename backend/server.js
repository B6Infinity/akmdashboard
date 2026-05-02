import express from "express";
import cors from "cors";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { WARD_RECORDS } from "./data/wardData.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());

app.get("/api/wards", async (_request, response) => {
  const filePath = path.resolve(process.cwd(), "..", "AKM_Wards.geojson");
  const raw = await readFile(filePath, "utf8");
  const geojson = JSON.parse(raw);
  const wardById = new Map(WARD_RECORDS.map((ward) => [ward.id, ward]));

  geojson.features = geojson.features.map((feature) => {
    const wardId = Number(feature.properties.ward_no);
    const ward = wardById.get(wardId);

    if (!ward) {
      return feature;
    }

    return {
      ...feature,
      properties: {
        ...feature.properties,
        ward_id: ward.id,
        ward_name: ward.name,
        population: ward.population,
        area_ha: ward.area_ha,
        density: Math.round(ward.population / ward.area_ha),
      },
    };
  });

  response.json(geojson);
});

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});