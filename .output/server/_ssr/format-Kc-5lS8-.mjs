//#region node_modules/.nitro/vite/services/ssr/assets/format-Kc-5lS8-.js
function koboToNaira(kobo) {
	return kobo / 100;
}
function formatNaira(kobo) {
	return `\u20a6${koboToNaira(kobo).toLocaleString("en-NG", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	})}`;
}
function formatDateTime(ts) {
	return new Date(ts).toLocaleString("en-NG", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});
}
//#endregion
export { formatDateTime, formatNaira };
