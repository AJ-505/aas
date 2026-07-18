import { resolveDotSegments } from "./h3+rou3+srvx.mjs";
//#region node_modules/h3-rules/dist/_chunks/_utils.mjs
function canonicalPath(pathname) {
	return resolveDotSegments(pathname, { decodeSlashes: true });
}
//#endregion
//#region node_modules/h3-rules/dist/_chunks/normalize.mjs
function mergeMatchedRouteRules(rawLayers, canonicalLayers) {
	const routeRules = resolveLayers(rawLayers);
	if (canonicalLayers?.length) {
		const canonicalRules = resolveLayers(canonicalLayers);
		for (const rule of Object.values(canonicalRules)) mergeRouteRule(routeRules, rule, rule.params);
	}
	return routeRules;
}
function resolveLayers(layers) {
	const lastData = layers?.[layers.length - 1]?.data;
	if (lastData && !Array.isArray(lastData)) return resolvePreMergedLayers(layers, lastData);
	const routeRules = {};
	for (const layer of layers || []) for (const entry of layer.data) mergeRouteRule(routeRules, entry, layer.params);
	return routeRules;
}
function isMergeableObject(value) {
	return value !== null && typeof value === "object";
}
function mergeRuleOptions(current, incoming) {
	return isMergeableObject(current) && isMergeableObject(incoming) ? {
		...current,
		...incoming
	} : incoming;
}
function resolvePreMergedLayers(layers, lastData) {
	const routeRules = {};
	for (const entry of lastData.rules) {
		const paramRoutes = entry.paramRoutes;
		let params;
		for (const layer of layers) {
			const layerParams = layer.params;
			if (!layerParams) continue;
			const layerRoute = layer.data.route;
			if (paramRoutes ? paramRoutes.includes(layerRoute) : layerRoute === entry.route) params = params ? {
				...params,
				...layerParams
			} : layerParams;
		}
		routeRules[entry.name] = {
			name: entry.name,
			route: entry.route,
			method: entry.method,
			options: entry.options,
			handler: entry.handler,
			params
		};
	}
	return routeRules;
}
function mergeRouteRule(routeRules, rule, params) {
	const name = rule.name;
	const currentRule = routeRules[name];
	if (currentRule) {
		if (rule.options === false) {
			delete routeRules[name];
			return;
		}
		currentRule.options = mergeRuleOptions(currentRule.options, rule.options);
		currentRule.route = rule.route;
		currentRule.method = rule.method;
		if (currentRule.params || params) currentRule.params = {
			...currentRule.params,
			...params
		};
	} else if (rule.options !== false) routeRules[name] = {
		...rule,
		params
	};
}
var headers = {
	order: -1,
	handler: (m) => {
		const entries = Object.entries(m.options || {});
		return async function headersRouteRule(event, next) {
			const response = await next();
			for (const [key, value] of entries) event.res.headers.set(key, value);
			return response;
		};
	}
};
function createMatcherFromFind(findRouteRules) {
	return (method, pathname) => {
		const rawLayers = findRouteRules(method, pathname);
		const canonical = canonicalPath(pathname);
		const canonicalLayers = canonical === pathname ? void 0 : findRouteRules(method, canonical);
		if (!rawLayers?.length && !canonicalLayers?.length) return {
			routeRules: {},
			routeRuleMiddleware: []
		};
		const routeRules = mergeMatchedRouteRules(rawLayers, canonicalLayers);
		const routeRuleMiddleware = [];
		const matchedRules = Object.values(routeRules);
		const orderedRules = matchedRules.length > 1 ? matchedRules.sort(compareRuleOrder) : matchedRules;
		for (const rule of orderedRules) {
			if (!rule.handler) continue;
			routeRuleMiddleware.push(rule.handler.handler(rule));
		}
		return {
			routeRules,
			routeRuleMiddleware
		};
	};
}
function memoizeRouteRulesMatcher(matcher, opts) {
	const max = opts?.max ?? 1024;
	if (max <= 0) return matcher;
	const memo = /* @__PURE__ */ new Map();
	return (method, pathname) => {
		const key = method + " " + pathname;
		let result = memo.get(key);
		if (!result) {
			result = matcher(method, pathname);
			if (memo.size >= max) memo.delete(memo.keys().next().value);
			memo.set(key, result);
		}
		return result;
	};
}
var compareRuleOrder = (a, b) => orderWeight(a.handler) - orderWeight(b.handler);
function orderWeight(handler) {
	return handler?.order ?? 0;
}
//#endregion
export { createMatcherFromFind, headers, memoizeRouteRulesMatcher };
