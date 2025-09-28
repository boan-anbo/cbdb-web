#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const shapefile = require('shapefile');

async function convertShapefileToGeoJSON() {
  const inputPath = path.join(__dirname, '../../../references/chgis/v6_time_cnty_pts_utf_wgs84');
  const outputDir = path.join(__dirname, '../public/data/chgis');
  const outputPath = path.join(outputDir, 'chgis_counties.json');

  console.log('Converting CHGIS shapefile to GeoJSON...');
  console.log('Input:', inputPath + '.shp');
  console.log('Output:', outputPath);

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    const features = [];

    // Read shapefile
    const source = await shapefile.open(inputPath + '.shp', inputPath + '.dbf', {
      encoding: 'utf-8'
    });

    let result;
    while (!(result = await source.read()).done) {
      // With WGS84 data, coordinates should be valid

      // Convert each feature
      const feature = {
        type: 'Feature',
        properties: {
          name_py: result.value.properties.NAME_PY,
          name_ch: result.value.properties.NAME_CH,
          name_ft: result.value.properties.NAME_FT,
          x_coord: result.value.properties.X_COOR,
          y_coord: result.value.properties.Y_COOR,
          type_py: result.value.properties.TYPE_PY,
          type_ch: result.value.properties.TYPE_CH,
          beg_yr: result.value.properties.BEG_YR,
          end_yr: result.value.properties.END_YR,
          sys_id: result.value.properties.SYS_ID,
          geo_src: result.value.properties.GEO_SRC,
          compiler: result.value.properties.COMPILER,
          geocompil: result.value.properties.GEOCOMPIL,
          checker: result.value.properties.CHECKER,
          ent_date: result.value.properties.ENT_DATE,
          beg_rule: result.value.properties.BEG_RULE,
          end_rule: result.value.properties.END_RULE,
          note: result.value.properties.NOTE,
          obj_type: result.value.properties.OBJ_TYPE,
          pres_loc: result.value.properties.PRES_LOC,
          type_utf: result.value.properties.TYPE_UTF,
          lev_rank: result.value.properties.LEV_RANK
        },
        geometry: result.value.geometry
      };
      features.push(feature);
    }

    const geojson = {
      type: 'FeatureCollection',
      features: features
    };

    // Write GeoJSON file
    fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));

    console.log(`Successfully converted ${features.length} features to GeoJSON`);
    console.log('Output saved to:', outputPath);

    // Print some statistics
    const years = features.map(f => [f.properties.beg_yr, f.properties.end_yr]).flat().filter(y => y);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    console.log('\nStatistics:');
    console.log(`Total features: ${features.length}`);
    console.log(`Year range: ${minYear} to ${maxYear}`);

    const types = new Set(features.map(f => f.properties.type_ch).filter(Boolean));
    console.log(`Unique types: ${types.size}`);

  } catch (error) {
    console.error('Error converting shapefile:', error);
    process.exit(1);
  }
}

convertShapefileToGeoJSON();