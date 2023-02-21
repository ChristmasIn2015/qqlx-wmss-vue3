import { defineStore } from "pinia";

import { PATH_WMSS_ROLE, MAP_ENUM_ROLE_WMSS, ENUM_ROLE_WMSS } from "qqlx-core";
import type { getRoleWMSSDto, getRoleWMSSRes, postRoleWMSSDto, postRoleWMSSRes, deleteRoleWMSSDto, deleteRoleWMSSRes } from "qqlx-core/dto/wmss/role";
import type { User } from "qqlx-core/schema/user/user";
import type { RoleWMSS } from "qqlx-core/schema/wmss/role";
import type { RoleWMSSJoined } from "qqlx-core/dto/wmss/role";

import { getMongodbBase, request } from "@/utils";
import { useNotifyStore } from "@/stores/notify";
const NotifyStore = useNotifyStore();

function getSchema(): RoleWMSS {
	return {
		corpId: "",
		userId: "",
		role: ENUM_ROLE_WMSS.BASE,
		...getMongodbBase(),
	};
}

export const useRoleWMSSStore = defineStore("RoleWMSS", {
	state: () => ({
		OPTION_ENUM_ROLE_WMSS: MAP_ENUM_ROLE_WMSS.filter((e) =>
			[
				//
				ENUM_ROLE_WMSS.PURCHASE,
				ENUM_ROLE_WMSS.WM,
				ENUM_ROLE_WMSS.FINANCE,
				ENUM_ROLE_WMSS.SALES,
			].includes(e.value)
		),
		RoleWMSSEnumIndexNow: 0,
		//
		RoleEditor: getSchema(),
		RoleWMSSList: [] as RoleWMSSJoined[],
	}),
	actions: {
		// 获取店铺角色
		async get() {
			const dto: getRoleWMSSDto = null;
			const res: getRoleWMSSRes = await request.get(PATH_WMSS_ROLE);
			this.RoleWMSSList = res;
		},
		// 创建角色
		async post(askerId: string, role?: ENUM_ROLE_WMSS) {
			try {
				const schema = this.getSchema();
				schema.userId = askerId;
				if (role) schema.role = role;
				const dto: postRoleWMSSDto = schema;
				const res: postRoleWMSSRes = await request.post(PATH_WMSS_ROLE, { dto });
				await this.get();
				NotifyStore.success("创建成功");
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			}
		},
		// 删除角色
		async delete(roleId: string) {
			try {
				const dto: deleteRoleWMSSDto = { roleId };
				const res: deleteRoleWMSSRes = await request.delete(PATH_WMSS_ROLE, { dto });
				await this.get();
				NotifyStore.success("删除成功");
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			}
		},
		getSchema() {
			const schema: RoleWMSS = getSchema();
			return schema;
		},
		setSchema(entity?: RoleWMSS) {
			const schema: RoleWMSS = entity || getSchema();
			this.RoleEditor = JSON.parse(JSON.stringify(schema));
		},
	},
});
