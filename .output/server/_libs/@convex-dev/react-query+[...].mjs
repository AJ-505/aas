import { ConvexHttpClient, ConvexReactClient, convexToJson, getFunctionName } from "./auth+[...].mjs";
//#region node_modules/@tanstack/query-core/build/modern/timeoutManager.js
var defaultTimeoutProvider = {
	setTimeout: (callback, delay) => setTimeout(callback, delay),
	clearTimeout: (timeoutId) => clearTimeout(timeoutId),
	setInterval: (callback, delay) => setInterval(callback, delay),
	clearInterval: (intervalId) => clearInterval(intervalId)
};
var TimeoutManager = class {
	#provider = defaultTimeoutProvider;
	#providerCalled = false;
	setTimeoutProvider(provider) {
		this.#provider = provider;
	}
	setTimeout(callback, delay) {
		return this.#provider.setTimeout(callback, delay);
	}
	clearTimeout(timeoutId) {
		this.#provider.clearTimeout(timeoutId);
	}
	setInterval(callback, delay) {
		return this.#provider.setInterval(callback, delay);
	}
	clearInterval(intervalId) {
		this.#provider.clearInterval(intervalId);
	}
};
var timeoutManager = new TimeoutManager();
function systemSetTimeoutZero(callback) {
	setTimeout(callback, 0);
}
//#endregion
//#region node_modules/@tanstack/query-core/build/modern/utils.js
var isServer$1 = typeof window === "undefined" || "Deno" in globalThis;
function noop() {}
function functionalUpdate(updater, input) {
	return typeof updater === "function" ? updater(input) : updater;
}
function isValidTimeout(value) {
	return typeof value === "number" && value >= 0 && value !== Infinity;
}
function timeUntilStale(updatedAt, staleTime) {
	return Math.max(updatedAt + (staleTime || 0) - Date.now(), 0);
}
function resolveStaleTime(staleTime, query) {
	return typeof staleTime === "function" ? staleTime(query) : staleTime;
}
function resolveQueryBoolean(option, query) {
	return typeof option === "function" ? option(query) : option;
}
function matchQuery(filters, query) {
	const { type = "all", exact, fetchStatus, predicate, queryKey, stale } = filters;
	if (queryKey) {
		if (exact) {
			if (query.queryHash !== hashQueryKeyByOptions(queryKey, query.options)) return false;
		} else if (!partialMatchKey(query.queryKey, queryKey)) return false;
	}
	if (type !== "all") {
		const isActive = query.isActive();
		if (type === "active" && !isActive) return false;
		if (type === "inactive" && isActive) return false;
	}
	if (typeof stale === "boolean" && query.isStale() !== stale) return false;
	if (fetchStatus && fetchStatus !== query.state.fetchStatus) return false;
	if (predicate && !predicate(query)) return false;
	return true;
}
function matchMutation(filters, mutation) {
	const { exact, status, predicate, mutationKey } = filters;
	if (mutationKey) {
		if (!mutation.options.mutationKey) return false;
		if (exact) {
			if (hashKey(mutation.options.mutationKey) !== hashKey(mutationKey)) return false;
		} else if (!partialMatchKey(mutation.options.mutationKey, mutationKey)) return false;
	}
	if (status && mutation.state.status !== status) return false;
	if (predicate && !predicate(mutation)) return false;
	return true;
}
function hashQueryKeyByOptions(queryKey, options) {
	return (options?.queryKeyHashFn || hashKey)(queryKey);
}
function hashKey(queryKey) {
	return JSON.stringify(queryKey, (_, val) => isPlainObject(val) ? Object.keys(val).sort().reduce((result, key) => {
		result[key] = val[key];
		return result;
	}, {}) : val);
}
function partialMatchKey(a, b) {
	if (a === b) return true;
	if (typeof a !== typeof b) return false;
	if (a && b && typeof a === "object" && typeof b === "object") return Object.keys(b).every((key) => partialMatchKey(a[key], b[key]));
	return false;
}
var hasOwn = Object.prototype.hasOwnProperty;
function replaceEqualDeep(a, b, depth = 0) {
	if (a === b) return a;
	if (depth > 500) return b;
	const array = isPlainArray(a) && isPlainArray(b);
	if (!array && !(isPlainObject(a) && isPlainObject(b))) return b;
	const aSize = (array ? a : Object.keys(a)).length;
	const bItems = array ? b : Object.keys(b);
	const bSize = bItems.length;
	const copy = array ? new Array(bSize) : {};
	let equalItems = 0;
	for (let i = 0; i < bSize; i++) {
		const key = array ? i : bItems[i];
		const aItem = a[key];
		const bItem = b[key];
		if (aItem === bItem) {
			copy[key] = aItem;
			if (array ? i < aSize : hasOwn.call(a, key)) equalItems++;
			continue;
		}
		if (aItem === null || bItem === null || typeof aItem !== "object" || typeof bItem !== "object") {
			copy[key] = bItem;
			continue;
		}
		const v = replaceEqualDeep(aItem, bItem, depth + 1);
		copy[key] = v;
		if (v === aItem) equalItems++;
	}
	return aSize === bSize && equalItems === aSize ? a : copy;
}
function shallowEqualObjects(a, b) {
	if (!b || Object.keys(a).length !== Object.keys(b).length) return false;
	for (const key in a) if (a[key] !== b[key]) return false;
	return true;
}
function isPlainArray(value) {
	return Array.isArray(value) && value.length === Object.keys(value).length;
}
function isPlainObject(o) {
	if (!hasObjectPrototype(o)) return false;
	const ctor = o.constructor;
	if (ctor === void 0) return true;
	const prot = ctor.prototype;
	if (!hasObjectPrototype(prot)) return false;
	if (!prot.hasOwnProperty("isPrototypeOf")) return false;
	if (Object.getPrototypeOf(o) !== Object.prototype) return false;
	return true;
}
function hasObjectPrototype(o) {
	return Object.prototype.toString.call(o) === "[object Object]";
}
function sleep(timeout) {
	return new Promise((resolve) => {
		timeoutManager.setTimeout(resolve, timeout);
	});
}
function replaceData(prevData, data, options) {
	if (typeof options.structuralSharing === "function") return options.structuralSharing(prevData, data);
	else if (options.structuralSharing !== false) return replaceEqualDeep(prevData, data);
	return data;
}
function addToEnd(items, item, max = 0) {
	const newItems = [...items, item];
	return max && newItems.length > max ? newItems.slice(1) : newItems;
}
function addToStart(items, item, max = 0) {
	const newItems = [item, ...items];
	return max && newItems.length > max ? newItems.slice(0, -1) : newItems;
}
var skipToken = /* @__PURE__ */ Symbol();
function ensureQueryFn(options, fetchOptions) {
	if (!options.queryFn && fetchOptions?.initialPromise) return () => fetchOptions.initialPromise;
	if (!options.queryFn || options.queryFn === skipToken) return () => Promise.reject(/* @__PURE__ */ new Error(`Missing queryFn: '${options.queryHash}'`));
	return options.queryFn;
}
function shouldThrowError(throwOnError, params) {
	if (typeof throwOnError === "function") return throwOnError(...params);
	return !!throwOnError;
}
function addConsumeAwareSignal(object, getSignal, onCancelled) {
	let consumed = false;
	let signal;
	Object.defineProperty(object, "signal", {
		enumerable: true,
		get: () => {
			signal ??= getSignal();
			if (consumed) return signal;
			consumed = true;
			if (signal.aborted) onCancelled();
			else signal.addEventListener("abort", onCancelled, { once: true });
			return signal;
		}
	});
	return object;
}
//#endregion
//#region node_modules/@tanstack/query-core/build/modern/notifyManager.js
var defaultScheduler = systemSetTimeoutZero;
function createNotifyManager() {
	let queue = [];
	let transactions = 0;
	let notifyFn = (callback) => {
		callback();
	};
	let batchNotifyFn = (callback) => {
		callback();
	};
	let scheduleFn = defaultScheduler;
	const schedule = (callback) => {
		if (transactions) queue.push(callback);
		else scheduleFn(() => {
			notifyFn(callback);
		});
	};
	const flush = () => {
		const originalQueue = queue;
		queue = [];
		if (originalQueue.length) scheduleFn(() => {
			batchNotifyFn(() => {
				originalQueue.forEach((callback) => {
					notifyFn(callback);
				});
			});
		});
	};
	return {
		batch: (callback) => {
			let result;
			transactions++;
			try {
				result = callback();
			} finally {
				transactions--;
				if (!transactions) flush();
			}
			return result;
		},
		/**
		* All calls to the wrapped function will be batched.
		*/
		batchCalls: (callback) => {
			return (...args) => {
				schedule(() => {
					callback(...args);
				});
			};
		},
		schedule,
		/**
		* Use this method to set a custom notify function.
		* This can be used to for example wrap notifications with `React.act` while running tests.
		*/
		setNotifyFunction: (fn) => {
			notifyFn = fn;
		},
		/**
		* Use this method to set a custom function to batch notifications together into a single tick.
		* By default React Query will use the batch function provided by ReactDOM or React Native.
		*/
		setBatchNotifyFunction: (fn) => {
			batchNotifyFn = fn;
		},
		setScheduler: (fn) => {
			scheduleFn = fn;
		}
	};
}
var notifyManager = createNotifyManager();
//#endregion
//#region node_modules/@convex-dev/react-query/dist/esm/index.js
var isServer = typeof window === "undefined";
function isConvexSkipped(queryKey) {
	return queryKey.length >= 2 && ["convexQuery", "convexAction"].includes(queryKey[0]) && queryKey[2] === "skip";
}
function isConvexQuery(queryKey) {
	return queryKey.length >= 2 && queryKey[0] === "convexQuery";
}
function isConvexAction(queryKey) {
	return queryKey.length >= 2 && queryKey[0] === "convexAction";
}
function hash(queryKey) {
	return `convexQuery|${getFunctionName(queryKey[1])}|${JSON.stringify(convexToJson(queryKey[2]))}`;
}
/**
* Subscribes to events from a TanStack Query QueryClient and populates query
* results in it for all Convex query function subscriptions.
*/
var ConvexQueryClient = class {
	convexClient;
	subscriptions;
	unsubscribe;
	serverHttpClient;
	_queryClient;
	get queryClient() {
		if (!this._queryClient) throw new Error("ConvexQueryClient not connected to TanStack QueryClient.");
		return this._queryClient;
	}
	constructor(client, options = {}) {
		if (typeof client === "string") this.convexClient = new ConvexReactClient(client, options);
		else this.convexClient = client;
		this.subscriptions = {};
		if (options.queryClient) {
			this._queryClient = options.queryClient;
			this.unsubscribe = this.subscribeInner(options.queryClient.getQueryCache());
		}
		if (isServer) this.serverHttpClient = new ConvexHttpClient(this.convexClient.address);
	}
	/** Complete initialization of ConvexQueryClient by connecting a TanStack QueryClient */
	connect(queryClient) {
		if (this.unsubscribe) throw new Error("already subscribed!");
		this._queryClient = queryClient;
		this.unsubscribe = this.subscribeInner(queryClient.getQueryCache());
	}
	/** Update every query key. Probably not useful, don't use this. */
	onUpdate = () => {
		notifyManager.batch(() => {
			for (const key of Object.keys(this.subscriptions)) this.onUpdateQueryKeyHash(key);
		});
	};
	onUpdateQueryKeyHash(queryHash) {
		const subscription = this.subscriptions[queryHash];
		if (!subscription) throw new Error(`Internal ConvexQueryClient error: onUpdateQueryKeyHash called for ${queryHash}`);
		const query = this.queryClient.getQueryCache().get(queryHash);
		if (!query) return;
		const { queryKey, watch } = subscription;
		let result;
		try {
			result = {
				ok: true,
				value: watch.localQueryResult()
			};
		} catch (error) {
			result = {
				ok: false,
				error
			};
		}
		if (result.ok) {
			const value = result.value;
			this.queryClient.setQueryData(queryKey, (prev) => {
				if (prev === void 0) return;
				return value;
			});
		} else {
			const { error } = result;
			query?.setState({
				error,
				errorUpdateCount: query.state.errorUpdateCount + 1,
				errorUpdatedAt: Date.now(),
				fetchFailureCount: query.state.fetchFailureCount + 1,
				fetchFailureReason: error,
				fetchStatus: "idle",
				status: "error"
			}, { meta: "set by ConvexQueryClient" });
		}
	}
	subscribeInner(queryCache) {
		if (isServer) return () => {};
		return queryCache.subscribe((event) => {
			if (!isConvexQuery(event.query.queryKey)) return;
			if (isConvexSkipped(event.query.queryKey)) return;
			switch (event.type) {
				case "removed":
					this.subscriptions[event.query.queryHash].unsubscribe();
					delete this.subscriptions[event.query.queryHash];
					break;
				case "added": {
					const [_, func, args, _opts] = event.query.queryKey;
					const watch = this.convexClient.watchQuery(func, args, {});
					const unsubscribe = watch.onUpdate(() => {
						this.onUpdateQueryKeyHash(event.query.queryHash);
					});
					this.subscriptions[event.query.queryHash] = {
						queryKey: event.query.queryKey,
						watch,
						unsubscribe
					};
					break;
				}
				case "observerAdded": break;
				case "observerRemoved":
					if (event.query.getObserversCount() === 0) {}
					break;
				case "observerResultsUpdated": break;
				case "updated":
					if (event.action.type === "setState" && event.action.setStateOptions?.meta === "set by ConvexQueryClient") break;
					break;
				case "observerOptionsUpdated": break;
			}
		});
	}
	/**
	* Returns a promise for the query result of a query key containing
	* `['convexQuery', FunctionReference, args]` and subscribes via WebSocket
	* to future updates.
	*
	* You can provide a custom fetch function for queries that are not
	* Convex queries.
	*/
	queryFn(otherFetch = throwBecauseNotConvexQuery) {
		return async (context) => {
			if (isConvexSkipped(context.queryKey)) throw new Error("Skipped query should not actually be run, should { enabled: false }");
			if (isConvexQuery(context.queryKey)) {
				const [_, func, args] = context.queryKey;
				if (isServer) return await this.serverHttpClient.consistentQuery(func, args);
				else return await this.convexClient.query(func, args);
			}
			if (isConvexAction(context.queryKey)) {
				const [_, func, args] = context.queryKey;
				if (isServer) return await new ConvexHttpClient(this.convexClient.address).action(func, args);
				else return await this.convexClient.action(func, args);
			}
			return otherFetch(context);
		};
	}
	/**
	* Set this globally to use Convex query functions.
	*
	* ```ts
	* const queryClient = new QueryClient({
	*   defaultOptions: {
	*    queries: {
	*       queryKeyHashFn: convexQueryClient.hashFn(),
	*     },
	*   },
	* });
	*
	* You can provide a custom hash function for keys that are not for Convex
	* queries.
	*/
	hashFn(otherHashKey = hashKey) {
		return (queryKey) => {
			if (isConvexQuery(queryKey)) return hash(queryKey);
			return otherHashKey(queryKey);
		};
	}
	/**
	* Query options factory for Convex query function subscriptions.
	*
	* ```
	* useQuery(client.queryOptions(api.foo.bar, args))
	* ```
	*
	* If you need to specify other options spread it:
	* ```
	* useQuery({
	*   ...convexQueryClient.queryOptions(api.foo.bar, args),
	*   placeholderData: { name: "me" }
	* });
	* ```
	*/
	queryOptions = (funcRef, queryArgs) => {
		return {
			queryKey: [
				"convexQuery",
				getFunctionName(funcRef),
				queryArgs
			],
			queryFn: this.queryFn(),
			staleTime: Infinity
		};
	};
};
/**
* Query options factory for Convex query function subscriptions.
* This options factory requires the `convexQueryClient.queryFn()` has been set
* as the default `queryFn` globally.
*
* ```
* useQuery(convexQuery(api.foo.bar, args))
* ```
*
* If you need to specify other options spread it:
* ```
* useQuery({
*   ...convexQuery(api.messages.list, { channel: 'dogs' }),
*   placeholderData: [{ name: "Snowy" }]
* });
* ```
*/
var convexQuery = (funcRef, queryArgs) => {
	return {
		queryKey: [
			"convexQuery",
			getFunctionName(funcRef),
			queryArgs === "skip" ? "skip" : queryArgs
		],
		staleTime: Infinity,
		...queryArgs === "skip" ? { enabled: false } : {}
	};
};
function throwBecauseNotConvexQuery(context) {
	throw new Error("Query key is not for a Convex Query: " + context.queryKey);
}
//#endregion
export { ConvexQueryClient, addConsumeAwareSignal, addToEnd, addToStart, convexQuery, ensureQueryFn, functionalUpdate, hashKey, hashQueryKeyByOptions, isServer$1 as isServer, isValidTimeout, matchMutation, matchQuery, noop, notifyManager, partialMatchKey, replaceData, resolveQueryBoolean, resolveStaleTime, shallowEqualObjects, shouldThrowError, skipToken, sleep, timeUntilStale, timeoutManager };
