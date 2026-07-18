import { require_jsx_runtime } from "../_libs/@convex-dev/auth+[...].mjs";
import { Button } from "./button-Ybh41ULA.mjs";
import { Card } from "./card-DIXlT7Xg.mjs";
import { Loader } from "./Loader-D3EQcPVE.mjs";
import { useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { useSetActiveMutation, useSetRoleMutation, userQueries } from "./queries-DshR6pBd.mjs";
import { Badge } from "./badge-sf2TMpr9.mjs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table-DM7va4oR.mjs";
import { zt } from "../_libs/react-hot-toast.mjs";
import { Avatar } from "./Avatar-nFAbCTVu.mjs";
import { ROLES, ROLE_LABELS } from "./enums-qnepMgfE.mjs";
import { Select } from "./select-CEiMGzFC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/users-DPdlTg3s.js
var import_jsx_runtime = require_jsx_runtime();
function UsersPage() {
	const { data: users, isLoading } = useQuery(userQueries.list());
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-[23px] font-extrabold tracking-tight text-ink",
			children: "User management"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-[13px] text-mute",
			children: "Assign roles and activate or deactivate team members."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Name" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "hidden md:table-cell",
					children: "Email"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "hidden lg:table-cell",
					children: "Phone"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Role" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { className: "w-28" })
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: !users || users.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
				colSpan: 6,
				className: "py-10 text-center text-mute",
				children: "No users found."
			}) }) : users.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRow, { user: u }, u._id)) })] })
		})]
	});
}
function UserRow({ user }) {
	const queryClient = useQueryClient();
	const setRole = useSetRoleMutation();
	const setActive = useSetActiveMutation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "whitespace-nowrap",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center gap-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
					name: user.name ?? user.email ?? "?",
					size: 28
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block font-semibold text-ink",
					children: user.name ?? "-"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-[11px] text-mute md:hidden",
					children: user.email ?? ""
				})] })]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "hidden text-body md:table-cell",
			children: user.email ?? "-"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
			className: "hidden text-body lg:table-cell",
			children: user.phone ?? "-"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
			className: "w-44",
			value: user.role ?? "",
			onChange: (e) => {
				const role = e.target.value;
				setRole.mutate({
					userId: user._id,
					role
				}, { onSuccess: () => {
					zt.success("Role updated.");
					queryClient.invalidateQueries();
				} });
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: "",
				disabled: true,
				children: "Unassigned"
			}), ROLES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: r,
				children: ROLE_LABELS[r]
			}, r))]
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
			dot: true,
			variant: user.active ? "success" : "destructive",
			children: user.active ? "Active" : "Inactive"
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			size: "sm",
			onClick: () => setActive.mutate({
				userId: user._id,
				active: !user.active
			}, { onSuccess: () => {
				zt.success(user.active ? "User deactivated." : "User activated.");
				queryClient.invalidateQueries();
			} }),
			children: user.active ? "Deactivate" : "Activate"
		}) })
	] });
}
//#endregion
export { UsersPage as component };
