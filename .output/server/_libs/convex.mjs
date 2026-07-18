import { toReferencePath } from "./@convex-dev/auth+[...].mjs";
//#region node_modules/convex/dist/esm/server/components/index.js
function createChildComponents(root, pathParts) {
	return new Proxy({}, { get(_, prop) {
		if (typeof prop === "string") return createChildComponents(root, [...pathParts, prop]);
		else if (prop === toReferencePath) {
			if (pathParts.length < 1) {
				const found = [root, ...pathParts].join(".");
				throw new Error(`API path is expected to be of the form \`${root}.childComponent.functionName\`. Found: \`${found}\``);
			}
			return `_reference/childComponent/` + pathParts.join("/");
		} else return;
	} });
}
var componentsGeneric = () => createChildComponents("components", []);
//#endregion
export { componentsGeneric };
