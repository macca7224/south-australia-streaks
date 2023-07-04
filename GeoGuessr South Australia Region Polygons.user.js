// ==UserScript==
// @name         GeoGuessr South Australia Region Polygons
// @description  Overlays South Australia region polygons on the map
// @version      0.1.1
// @author       miraclewhips & macca
// @match        *://*.geoguessr.com/*
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?domain=geoguessr.com
// @grant        none
// @copyright    2022, miraclewhips (https://github.com/miraclewhips)
// @license      MIT
// ==/UserScript==



const colorMap = {
	'Murray and Mallee': '#3ce67b',
	'Kangaroo Island': '#f8a30c',
	'Fleurieu': '#cefef2',
	'Eastern Adelaide': '#ffffcf',
	'Adelaide Hills': '#fed0d0',
	'Southern Adelaide': '#cefef2',
	'Western Adelaide': '#fed0d0',
	'Eyre and Western': '#ffffcf',
	'Yorke and Mid North': '#f8a30c',
	'Barossa, Light and Lower North': '#ffffcf',
	'Northern Adelaide': '#ffffcf',
	'Limestone Coast': '#cefef2',
	'Far North': '#3ce67b'
}


/* ############################################################################### */
/* ##### DON'T MODIFY ANYTHING BELOW HERE UNLESS YOU KNOW WHAT YOU ARE DOING ##### */
/* ############################################################################### */


// Script injection, extracted from unityscript extracted from extenssr:
// https://gitlab.com/nonreviad/extenssr/-/blob/main/src/injected_scripts/maps_api_injecter.ts
function overrideOnLoad(googleScript, observer, overrider) {
	const oldOnload = googleScript.onload
	googleScript.onload = (event) => {
			const google = window.google
			if (google) {
					observer.disconnect()
					overrider(google)
			}
			if (oldOnload) {
					oldOnload.call(googleScript, event)
			}
	}
}

function grabGoogleScript(mutations) {
	for (const mutation of mutations) {
			for (const newNode of mutation.addedNodes) {
					const asScript = newNode
					if (asScript && asScript.src && asScript.src.startsWith('https://maps.googleapis.com/')) {
							return asScript
					}
			}
	}
	return null
}

function injecter(overrider) {
	if (document.documentElement)
	{
			injecterCallback(overrider);
	}
}

function injecterCallback(overrider)
{
	new MutationObserver((mutations, observer) => {
			const googleScript = grabGoogleScript(mutations)
			if (googleScript) {
					overrideOnLoad(googleScript, observer, overrider)
			}
	}).observe(document.documentElement, { childList: true, subtree: true })
}

function addPolygons() {
    google.maps.Map = class extends google.maps.Map {
        constructor(...args) {
            super(...args);
            this.data.loadGeoJson('https://raw.githubusercontent.com/macca7224/south-australia-streaks/main/South_Australia_Regions.geojson');
            this.data.setStyle((feature) => {
                const name = feature.getProperty('region');
                const color = colorMap[name];

                return {
                    fillOpacity: 0.2,
                    fillColor: color,
                    strokeWeight: 1,
                    clickable: false
                }
            });
        }
    }
}

if (document.readyState !== 'loading') {
    injecter(() => {
        addPolygons();
    });
} else {
    document.addEventListener('DOMContentLoaded', (event) => {
        injecter(() => {
            addPolygons();
        });
    });
}
