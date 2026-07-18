globalThis.__nitro_main__ = import.meta.url;
import { H3Core, HTTPError, NodeResponse, defineHandler, defineLazyEventHandler, serve, toEventHandler } from "./_libs/h3+rou3+srvx.mjs";
import { createMatcherFromFind, headers, memoizeRouteRulesMatcher } from "./_libs/h3-rules.mjs";
import { decodePath, joinURL, withLeadingSlash, withoutTrailingSlash } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/assets/1-CL7TEKVL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a07-VcT9o4npqBiEqUMKqLv64NJ7LZU\"",
		"mtime": "2026-07-18T13:42:20.577Z",
		"size": 6663,
		"path": "../public/assets/1-CL7TEKVL.js"
	},
	"/assets/2-CwJSsMi0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1307-26eRUQ+yy9uVlxZ0YVrXMyS2cVQ\"",
		"mtime": "2026-07-18T13:42:20.577Z",
		"size": 4871,
		"path": "../public/assets/2-CwJSsMi0.js"
	},
	"/assets/3-C_JqNjJw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"173b-+7+Q+jG73A4CLYuyIHcwwPBSKMI\"",
		"mtime": "2026-07-18T13:42:20.577Z",
		"size": 5947,
		"path": "../public/assets/3-C_JqNjJw.js"
	},
	"/assets/4-Lf8nWUHe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f52-PI4BYozWFuUcZNn29qaz4hMRXDM\"",
		"mtime": "2026-07-18T13:42:20.577Z",
		"size": 3922,
		"path": "../public/assets/4-Lf8nWUHe.js"
	},
	"/assets/5-Bkurp1-B.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1802-ba+DZfyPs4FI8GhWWauaEke3K4s\"",
		"mtime": "2026-07-18T13:42:20.577Z",
		"size": 6146,
		"path": "../public/assets/5-Bkurp1-B.js"
	},
	"/assets/Avatar-DMCPksAV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28f-7blOgcFf3W0zGXJ+Gc7cOcSgJh8\"",
		"mtime": "2026-07-18T13:42:20.577Z",
		"size": 655,
		"path": "../public/assets/Avatar-DMCPksAV.js"
	},
	"/assets/Loader-DHiQSvVt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10d-K0VHdWO7mbS/nC4L97ZS8w1OacE\"",
		"mtime": "2026-07-18T13:42:20.578Z",
		"size": 269,
		"path": "../public/assets/Loader-DHiQSvVt.js"
	},
	"/assets/app-B7lg7Bbe.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"b091-VwNBat4oBygRgNHvzPaDjoTCIYg\"",
		"mtime": "2026-07-18T13:42:20.584Z",
		"size": 45201,
		"path": "../public/assets/app-B7lg7Bbe.css"
	},
	"/assets/appointments-5vnSuAJU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20ed-PaekR2frDg5xUcWqRixHPGFEkTY\"",
		"mtime": "2026-07-18T13:42:20.578Z",
		"size": 8429,
		"path": "../public/assets/appointments-5vnSuAJU.js"
	},
	"/assets/auth-DQiJbxkK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6f-3YzgSbOhKe3nugO+qo+3rD+842w\"",
		"mtime": "2026-07-18T13:42:20.578Z",
		"size": 111,
		"path": "../public/assets/auth-DQiJbxkK.js"
	},
	"/assets/badge-vdAHu7Ir.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"40a-JvBux3M7sx7DX13P6DGoNIfYHTQ\"",
		"mtime": "2026-07-18T13:42:20.578Z",
		"size": 1034,
		"path": "../public/assets/badge-vdAHu7Ir.js"
	},
	"/assets/button-CVeJaZrK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"416-HQ8wOR4LZVtIu/JKH+1dGK4BCIc\"",
		"mtime": "2026-07-18T13:42:20.578Z",
		"size": 1046,
		"path": "../public/assets/button-CVeJaZrK.js"
	},
	"/assets/card-ukOwxahe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11aec-UyDT5snEz6t5NQaHZZU/r8VLBHs\"",
		"mtime": "2026-07-18T13:42:20.578Z",
		"size": 72428,
		"path": "../public/assets/card-ukOwxahe.js"
	},
	"/assets/checkin-CGBiP2Y2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15f2-ZKjbuDXq/A9q7MW2vbDxpJaZsUs\"",
		"mtime": "2026-07-18T13:42:20.578Z",
		"size": 5618,
		"path": "../public/assets/checkin-CGBiP2Y2.js"
	},
	"/assets/customer._id-DTXaiN50.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1acc-yuNyCq9mCwLnoXv9BtHaKJaXmRg\"",
		"mtime": "2026-07-18T13:42:20.579Z",
		"size": 6860,
		"path": "../public/assets/customer._id-DTXaiN50.js"
	},
	"/assets/customer._id-PQdSvOnD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"369-lujcskr1+4XFjo0sR300wb/xAfY\"",
		"mtime": "2026-07-18T13:42:20.579Z",
		"size": 873,
		"path": "../public/assets/customer._id-PQdSvOnD.js"
	},
	"/assets/customers-x9aFMRNG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19c7-SD8uAZZqlO1xeDrN2hQE3DBnEpo\"",
		"mtime": "2026-07-18T13:42:20.579Z",
		"size": 6599,
		"path": "../public/assets/customers-x9aFMRNG.js"
	},
	"/assets/dist-CUc5dwWj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2e60-hKT/IjGYZgGecAdBKF6IaHZXghU\"",
		"mtime": "2026-07-18T13:42:20.579Z",
		"size": 11872,
		"path": "../public/assets/dist-CUc5dwWj.js"
	},
	"/assets/enums-DPXOXvGC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"339-ddzEwvdWmaQ0NbXblH/US5BgD/c\"",
		"mtime": "2026-07-18T13:42:20.579Z",
		"size": 825,
		"path": "../public/assets/enums-DPXOXvGC.js"
	},
	"/assets/finance-C40zyyrp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1438-KMue6vxHzGVZOR7StrQq1NHQI5c\"",
		"mtime": "2026-07-18T13:42:20.580Z",
		"size": 5176,
		"path": "../public/assets/finance-C40zyyrp.js"
	},
	"/assets/format-Dqd9rcnD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"125-dI2ABkmR7LiKJTawha2WEd0AFSE\"",
		"mtime": "2026-07-18T13:42:20.580Z",
		"size": 293,
		"path": "../public/assets/format-Dqd9rcnD.js"
	},
	"/assets/icons-XCFw0Cuk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"121a-diXoeIiztk562LNFBLoDTEW5pO4\"",
		"mtime": "2026-07-18T13:42:20.580Z",
		"size": 4634,
		"path": "../public/assets/icons-XCFw0Cuk.js"
	},
	"/assets/index-Cp5JDi_R.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4a5f1-JxEyvtvX3XsvQqa9TbsQ21ldv4U\"",
		"mtime": "2026-07-18T13:42:20.575Z",
		"size": 304625,
		"path": "../public/assets/index-Cp5JDi_R.js"
	},
	"/assets/inventory-SLkLh4oC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"850-oWQ1ez7zhxK9c+tK/vc7UyfDB0I\"",
		"mtime": "2026-07-18T13:42:20.580Z",
		"size": 2128,
		"path": "../public/assets/inventory-SLkLh4oC.js"
	},
	"/assets/job._id-CLgq_MFH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"56ce-ZdwB4Ns/cJh/z/dExerEeYP8qqw\"",
		"mtime": "2026-07-18T13:42:20.580Z",
		"size": 22222,
		"path": "../public/assets/job._id-CLgq_MFH.js"
	},
	"/assets/job._id-CZWO4M8U.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3b2-kcaKufx/EAcQ/Euj1PE/4su4BVs\"",
		"mtime": "2026-07-18T13:42:20.580Z",
		"size": 946,
		"path": "../public/assets/job._id-CZWO4M8U.js"
	},
	"/assets/jobs-Ct2vzpBJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fa4-xQVCopotEZCKkTAC/LPqxStNfIM\"",
		"mtime": "2026-07-18T13:42:20.580Z",
		"size": 4004,
		"path": "../public/assets/jobs-Ct2vzpBJ.js"
	},
	"/assets/jsx-runtime-bzQ4Vb5N.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20d8-vMfP+4a4ykIjbw4InHkj3E5HWt0\"",
		"mtime": "2026-07-18T13:42:20.580Z",
		"size": 8408,
		"path": "../public/assets/jsx-runtime-bzQ4Vb5N.js"
	},
	"/assets/label-NOiUJ-WE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2a4-ruOnbg0JQ/Nb+aMX4Pbh3I4LPeg\"",
		"mtime": "2026-07-18T13:42:20.581Z",
		"size": 676,
		"path": "../public/assets/label-NOiUJ-WE.js"
	},
	"/assets/lead._id-Cj8dylqD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"114a-j4sf71+wiJT7Vrhoc1oZ8SmICbc\"",
		"mtime": "2026-07-18T13:42:20.581Z",
		"size": 4426,
		"path": "../public/assets/lead._id-Cj8dylqD.js"
	},
	"/assets/lead._id-K3f0ifLZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2e1-RLyBYUdpi2IhTa3L1himpR2TaeU\"",
		"mtime": "2026-07-18T13:42:20.581Z",
		"size": 737,
		"path": "../public/assets/lead._id-K3f0ifLZ.js"
	},
	"/assets/leads-BFH4acr3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1038-LWU0YEJ3K1MRJiIpiXNL4s90sFM\"",
		"mtime": "2026-07-18T13:42:20.581Z",
		"size": 4152,
		"path": "../public/assets/leads-BFH4acr3.js"
	},
	"/assets/link-CTtQX5pI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"66ac-DFy9SAMSuxCZ0Sn40RKmsfKe4Kc\"",
		"mtime": "2026-07-18T13:42:20.581Z",
		"size": 26284,
		"path": "../public/assets/link-CTtQX5pI.js"
	},
	"/assets/login-Dhc6wnR1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f99-5CmDM0nRk9yAD9ZoXlBWX0noJOc\"",
		"mtime": "2026-07-18T13:42:20.581Z",
		"size": 3993,
		"path": "../public/assets/login-Dhc6wnR1.js"
	},
	"/assets/order._id-C2fq1x1v.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"29f-4VbW6AnydsUJ9bfQSyX7jaSEMzY\"",
		"mtime": "2026-07-18T13:42:20.581Z",
		"size": 671,
		"path": "../public/assets/order._id-C2fq1x1v.js"
	},
	"/assets/order._id-DK1AZ6-c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1686-fyZGh2pAvpIj4WvXukncLI6QqqM\"",
		"mtime": "2026-07-18T13:42:20.581Z",
		"size": 5766,
		"path": "../public/assets/order._id-DK1AZ6-c.js"
	},
	"/assets/orders-8TzeKqFS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8d5-hrFwP2Jmya/TgBywsmw/St76hcs\"",
		"mtime": "2026-07-18T13:42:20.581Z",
		"size": 2261,
		"path": "../public/assets/orders-8TzeKqFS.js"
	},
	"/assets/parts-DspS8LAo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2799-kb6swBYfCSRbzMoY/fICXYWJ320\"",
		"mtime": "2026-07-18T13:42:20.582Z",
		"size": 10137,
		"path": "../public/assets/parts-DspS8LAo.js"
	},
	"/assets/preload-helper-CoI97Bvw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1874-pdjZ5po9BhC+EUBZR8jCNhGgD1w\"",
		"mtime": "2026-07-18T13:42:20.582Z",
		"size": 6260,
		"path": "../public/assets/preload-helper-CoI97Bvw.js"
	},
	"/assets/queries-C6N9N5sK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8fb9-iCxRIFYFCGzR7ys2+St1D/xt6hE\"",
		"mtime": "2026-07-18T13:42:20.582Z",
		"size": 36793,
		"path": "../public/assets/queries-C6N9N5sK.js"
	},
	"/assets/react-hbfaL-yQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20ce-X+XRcSfs4OdcXSrRo1jRsQb2+fw\"",
		"mtime": "2026-07-18T13:42:20.582Z",
		"size": 8398,
		"path": "../public/assets/react-hbfaL-yQ.js"
	},
	"/assets/reset-password-BmhMM7nJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a3d-baviLUdrpiOcMql/OJswjW/lP4U\"",
		"mtime": "2026-07-18T13:42:20.582Z",
		"size": 2621,
		"path": "../public/assets/reset-password-BmhMM7nJ.js"
	},
	"/assets/routes-BkmEYTcp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2935-FjvmEDYZM8yyAmxb4UkGohqfRLE\"",
		"mtime": "2026-07-18T13:42:20.582Z",
		"size": 10549,
		"path": "../public/assets/routes-BkmEYTcp.js"
	},
	"/assets/select-BWeZ7yFv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2ba-wKUJAKMyeHrZuNo7Z07Wn9hqjnw\"",
		"mtime": "2026-07-18T13:42:20.582Z",
		"size": 698,
		"path": "../public/assets/select-BWeZ7yFv.js"
	},
	"/assets/status-ui-BzBEgv1Q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"168-C3lTf8ZY2trTR0lEYypSOlvQPxE\"",
		"mtime": "2026-07-18T13:42:20.583Z",
		"size": 360,
		"path": "../public/assets/status-ui-BzBEgv1Q.js"
	},
	"/assets/table-CE2_dnJe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3bd-LO9mrGO3F33vcwaoaW35OADxQtI\"",
		"mtime": "2026-07-18T13:42:20.583Z",
		"size": 957,
		"path": "../public/assets/table-CE2_dnJe.js"
	},
	"/assets/textarea-DIwR_MS7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1e5-qjfNULGwwsyR9gzhuY6WWrfNifU\"",
		"mtime": "2026-07-18T13:42:20.583Z",
		"size": 485,
		"path": "../public/assets/textarea-DIwR_MS7.js"
	},
	"/assets/useNavigate-B2IbGgNV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"181-hKTneXUe9rjuGpvR540XEwWi7pM\"",
		"mtime": "2026-07-18T13:42:20.583Z",
		"size": 385,
		"path": "../public/assets/useNavigate-B2IbGgNV.js"
	},
	"/assets/useRouter-Cjk_0i46.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"97-gJK3oOHMBg6w7z3BqmB1RWGawXE\"",
		"mtime": "2026-07-18T13:42:20.583Z",
		"size": 151,
		"path": "../public/assets/useRouter-Cjk_0i46.js"
	},
	"/assets/users-BKoGuNpA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b2f-cmZz/vcMHq89Pw1xO5LJaVyQGD4\"",
		"mtime": "2026-07-18T13:42:20.583Z",
		"size": 2863,
		"path": "../public/assets/users-BKoGuNpA.js"
	},
	"/assets/utils-DVIDEbJ1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25e-WBL1nzGbQlD3hvNGDHZHdNOziNQ\"",
		"mtime": "2026-07-18T13:42:20.583Z",
		"size": 606,
		"path": "../public/assets/utils-DVIDEbJ1.js"
	},
	"/assets/utils-Dj9YtrFG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6cd3-QoiuRTQfBe4e3r+K4iUoGgVVgEc\"",
		"mtime": "2026-07-18T13:42:20.583Z",
		"size": 27859,
		"path": "../public/assets/utils-Dj9YtrFG.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets-node
function readAsset(id) {
	const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
	return promises.readFile(resolve(serverDir, public_assets_data_default[id].path));
}
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
function getAsset(id) {
	return public_assets_data_default[id];
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/static.mjs
var METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
var EncodingMap = {
	gzip: ".gz",
	br: ".br",
	zstd: ".zst"
};
var static_default = defineHandler((event) => {
	if (event.req.method && !METHODS.has(event.req.method)) return;
	let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
	let asset;
	const encodings = [...(event.req.headers.get("accept-encoding") || "").split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
	for (const encoding of encodings) for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
		const _asset = getAsset(_id);
		if (_asset) {
			asset = _asset;
			id = _id;
			break;
		}
	}
	if (!asset) {
		if (isPublicAssetURL(id)) {
			event.res.headers.delete("Cache-Control");
			throw new HTTPError({ status: 404 });
		}
		return;
	}
	if (encodings.length > 1) event.res.headers.append("Vary", "Accept-Encoding");
	if (event.req.headers.get("if-none-match") === asset.etag) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	const ifModifiedSinceH = event.req.headers.get("if-modified-since");
	const mtimeDate = new Date(asset.mtime);
	if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	if (asset.type) event.res.headers.set("Content-Type", asset.type);
	if (asset.etag && !event.res.headers.has("ETag")) event.res.headers.set("ETag", asset.etag);
	if (asset.mtime && !event.res.headers.has("Last-Modified")) event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
	if (asset.encoding && !event.res.headers.has("Content-Encoding")) event.res.headers.set("Content-Encoding", asset.encoding);
	if (asset.size > 0 && !event.res.headers.has("Content-Length")) event.res.headers.set("Content-Length", asset.size.toString());
	return readAsset(id);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = {
		route: "/assets/**",
		rules: [{
			name: "headers",
			route: "/assets/**",
			handler: headers,
			options: { "cache-control": "public, max-age=31536000, immutable" }
		}]
	};
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1);
		let s = p.split("/");
		if (s.length > 1 && s[s.length - 1] === "") {
			s.pop();
			p = p.slice(0, -1);
		}
		if (s.length > 1) {
			if (s[1] === "assets") r.push({
				data: $0,
				params: { "_": p.slice(8) }
			});
		}
		return r.reverse();
	};
})();
var _lazy_wfT178 = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_wfT178
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
var globalMiddleware = [toEventHandler(static_default)].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~middleware"].push(...globalMiddleware);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		middleware.push(...h3App["~middleware"]);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
var _matchRouteRules;
function getRouteRules(method, pathname) {
	return (_matchRouteRules ??= memoizeRouteRulesMatcher(createMatcherFromFind(findRouteRules)))(method, pathname);
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/hooks.mjs
function _captureError(error, type) {
	console.error(`[${type}]`, error);
	useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
	process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
	process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
//#endregion
//#region #nitro/virtual/tracing
var tracingSrvxPlugins = [];
//#endregion
//#region node_modules/nitro/dist/presets/node/runtime/node-server.mjs
var _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
var port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
var host = process.env.NITRO_HOST || process.env.HOST;
var cert = process.env.NITRO_SSL_CERT;
var key = process.env.NITRO_SSL_KEY;
var nitroApp = useNitroApp();
serve({
	port,
	hostname: host,
	tls: cert && key ? {
		cert,
		key
	} : void 0,
	fetch: nitroApp.fetch,
	plugins: [...tracingSrvxPlugins]
});
trapUnhandledErrors();
var node_server_default = {};
//#endregion
export { node_server_default as default };
