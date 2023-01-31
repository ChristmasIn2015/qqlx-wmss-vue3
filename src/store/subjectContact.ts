import { defineStore } from "pinia";
import { cloneDeep, debounce } from "lodash";

import { MongodbPage } from "qqlx-core/utils/database";
import { ENUM_SYSTEM_ROLE, ENUM_SUBJECT_ROLE, ENUM_SUBJECT_TYPE, SUBJECT_CONTACT_PATH } from "qqlx-core";
import { postContactDto, postContactRes, getContactDto, getContactRes, patchContactDto, patchContactRes } from "qqlx-core/brand/dto";
import { User } from "qqlx-core/user/entity";
import { Subject, SubjectContact } from "qqlx-core/brand/entity";

import { getMongodbBase, request, getPage } from "./utils";
import { useSnackbarStore } from "@/store/snackbar";

const SnackbarStore = useSnackbarStore();

function getSchema(): SubjectContact {
	return {
		subjectId: "",
		isDisabled: false,
		type: ENUM_SUBJECT_TYPE.COMPANY,
		corporation: "",
		name: "",
		address: "",
		contact: "",
		remark: "",
		...getMongodbBase(),
	};
}

export const useSubjectContactStore = defineStore("SubjectContact", {
	state: () => ({
		subjectContactSearch: getSchema() as SubjectContact,
		subjectContactEditor: getSchema() as SubjectContact,
		subjectContactPicked: getSchema() as SubjectContact,
		subjectContactListExcel: [] as SubjectContact[],
		subjectContactList: [] as SubjectContact[],
		page: getPage(20) as MongodbPage,
		total: 0,
		loadding: false,
		dialog: false,
		dialogNext: function () {} as Function,
		// 客户关键词搜索
		keyword: "",
		subjectContactListKeyword: [] as { title: string; value: string }[],
	}),
	actions: {
		async get(page?: number) {
			try {
				this.page.startTime = 0;
				if (page && page > 0) this.page.page = page;
				if (this.page.page === 1) this.subjectContactList = [];
				this.loadding = true;

				const dto: getContactDto = { page: this.page, search: this.subjectContactSearch };
				const res: getContactRes = await request.get(SUBJECT_CONTACT_PATH, { dto });
				this.subjectContactList = this.subjectContactList.concat(res.list);
				this.total = res.total;

				if (res.list.length > 0) this.page.page++;
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			} finally {
				this.loadding = false;
			}
		},
		async get10() {
			try {
				this.loadding = true;

				const dto: getContactDto = { page: getPage(10), search: this.getSchema(), keyword: this.keyword };
				const res: getContactRes = await request.get(SUBJECT_CONTACT_PATH, { dto });
				this.subjectContactListKeyword = res.list.map((e) => ({ title: `${e.name} / ${e.remark}`, value: e._id }));
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			} finally {
				this.loadding = false;
			}
		},
		async post() {
			try {
				const dto: postContactDto = this.subjectContactListExcel;
				const res: postContactRes = await request.post(SUBJECT_CONTACT_PATH, { dto });
				await this.get(1);
				SnackbarStore.setSuccess("添加成功");

				this.setSchema();
				this.subjectContactListExcel = [];
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			}
		},
		async patch(contact?: SubjectContact) {
			try {
				const target = contact || this.subjectContactEditor;
				const dto: patchContactDto = target;
				const res: patchContactRes = await request.patch(SUBJECT_CONTACT_PATH, { dto });

				this.setSchema();
				this.subjectContactSearch.name = target.name;
				this.subjectContactSearch.isDisabled = target.isDisabled;
				await this.get(1);
				SnackbarStore.setSuccess("修改成功");
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			}
		},
		pick(contact: SubjectContact) {
			this.subjectContactEditor = JSON.parse(JSON.stringify(contact));
		},
		getSchema() {
			const schema: SubjectContact = getSchema();
			return schema;
		},
		setSchema() {
			this.subjectContactEditor = this.getSchema();
			this.subjectContactSearch = this.getSchema();
			this.subjectContactPicked = this.getSchema();
		},
		openDialog(next: Function) {
			this.subjectContactListExcel = [];
			this.setSchema();

			this.dialogNext = next;
			this.dialog = true;
		},
		closeDialog(contact?: SubjectContact) {
			this.subjectContactListExcel = [];
			this.dialogNext && contact && this.dialogNext(JSON.parse(JSON.stringify(contact)));
			this.dialog = false;
		},
	},
});
