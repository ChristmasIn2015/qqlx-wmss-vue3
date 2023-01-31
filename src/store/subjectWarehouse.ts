import { defineStore } from "pinia";

import { ENUM_SYSTEM_ROLE, ENUM_SUBJECT_ROLE, SUBJECT_WAREHOUSE_PATH } from "qqlx-core";
import {
	postSubjectWarehouseDto,
	postSubjectWarehouseRes,
	getSubjectWarehouseDto,
	getSubjectWarehouseRes,
	patchSubjectWarehouseDto,
	patchSubjectWarehouseRes,
} from "qqlx-core/brand/dto";
import { User } from "qqlx-core/user/entity";
import { Subject, SubjectWarehouse } from "qqlx-core/brand/entity";

import { getMongodbBase, request } from "./utils";

function getSchema(): SubjectWarehouse {
	return {
		subjectId: "",
		name: "",
		address: "",
		...getMongodbBase(),
	};
}

export const useSubjectWarehouseStore = defineStore("SubjectWarehouse", {
	state: () =>
		({
			subjectWarehouseEditor: getSchema(),
			subjectWarehouseList: [],
		} as {
			subjectWarehouseEditor: SubjectWarehouse;
			subjectWarehouseList: SubjectWarehouse[];
		}),
	actions: {
		async get() {
			const dto: getSubjectWarehouseDto = null;
			const res: getSubjectWarehouseRes = await request.get(SUBJECT_WAREHOUSE_PATH);
			this.subjectWarehouseList = res.list;
		},
		async post() {
			const dto: postSubjectWarehouseDto = this.subjectWarehouseEditor;
			const res: postSubjectWarehouseRes = await request.post(SUBJECT_WAREHOUSE_PATH, { dto });
			await this.get();
		},
		async patch() {
			const dto: patchSubjectWarehouseDto = this.subjectWarehouseEditor;
			const res: patchSubjectWarehouseRes = await request.delete(SUBJECT_WAREHOUSE_PATH, { dto });
			await this.get();
		},
		getSchema() {
			const schema: SubjectWarehouse = getSchema();
			return schema;
		},
		setSchema() {
			this.subjectWarehouseEditor = this.getSchema();
		},
	},
});
