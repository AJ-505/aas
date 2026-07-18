import { convexQuery } from "../_libs/@convex-dev/react-query+[...].mjs";
import { useQuery } from "../_libs/tanstack__react-query.mjs";
import { api } from "./queries-DshR6pBd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-BJb3cJTg.js
function useCurrentUser() {
	return useQuery(convexQuery(api.users.me, {}));
}
//#endregion
export { useCurrentUser };
