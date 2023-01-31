import { defineStore } from "pinia";

import { ENUM_SYSTEM_ROLE, ENUM_SUBJECT_ROLE, USER_PATH, SUBJECT_ROLE_PATH } from "qqlx-core";
import { postSubjectRoleDto, postSubjectRoleRes, getSubjectRoleDto, getSubjectRoleRes, deleteSubjectRoleDto, deleteSubjectRoleRes } from "qqlx-core/brand/dto";
import { User } from "qqlx-core/user/entity";
import { Subject, SubjectRole } from "qqlx-core/brand/entity";

import { getMongodbBase, request } from "./utils";

export const useSubjectRoleStore = defineStore("SubjectRole", {
	state: () => ({
		subjectRoleList: [] as getSubjectRoleRes,
		subjectRoleEnum: [
			{ text: "所有成员", value: ENUM_SUBJECT_ROLE.MANAGER },
			{ text: "仓库管理", value: ENUM_SUBJECT_ROLE.WM },
			{ text: "采购员", value: ENUM_SUBJECT_ROLE.PURCHASE },
			{ text: "销售员", value: ENUM_SUBJECT_ROLE.SALES },
			{ text: "财务管理", value: ENUM_SUBJECT_ROLE.FINANCE },
		],
		subjectRoleEnumIndexNow: 0,
	}),
	actions: {
		// 获取店铺角色
		async get() {
			const dto: getSubjectRoleDto = null;
			const res: getSubjectRoleRes = await request.get(SUBJECT_ROLE_PATH);
			this.subjectRoleList = res;
		},
		// 创建角色
		async post(askerId: string, subjectId: string) {
			const schema = this.getSchema();
			schema.subjectId = subjectId;
			schema.userId = askerId;
			const dto: postSubjectRoleDto = { role: schema };
			const res: postSubjectRoleRes = await request.post(SUBJECT_ROLE_PATH, { dto });
			await this.get();
		},
		// 删除角色
		async delete(roleId: string) {
			const dto: deleteSubjectRoleDto = { roleId };
			const res: deleteSubjectRoleRes = await request.delete(SUBJECT_ROLE_PATH, { dto });
			await this.get();
		},
		getSchema() {
			const schema: SubjectRole = {
				subjectId: "",
				userId: "",
				role: ENUM_SUBJECT_ROLE.NONE,
				...getMongodbBase(),
			};
			return schema;
		},
	},
});
