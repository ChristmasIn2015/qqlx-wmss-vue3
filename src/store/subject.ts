import { defineStore } from "pinia";
import { cloneDeep, omit } from "lodash";

import { ENUM_SYSTEM_ROLE, ENUM_SUBJECT_TYPE, USER_PATH, SUBJECT_PATH } from "qqlx-core";
import {
	postSubjectDto,
	postSubjectRes,
	getSubjectDto,
	getSubjectRes,
	patchSubjectDto,
	patchSubjectRes,
	deleteSubjectDto,
	deleteSubjectRes,
} from "qqlx-core/brand/dto";
import { User } from "qqlx-core/user/entity";
import { Subject } from "qqlx-core/brand/entity";

import { getMongodbBase, request } from "./utils";
import { useSnackbarStore } from "@/store/snackbar";
import { useSubjectRoleStore } from "@/store/subjectRole";

const SnackbarStore = useSnackbarStore();
const SubjectRoleStore = useSubjectRoleStore();

function getSchema(): Subject {
	return {
		type: ENUM_SUBJECT_TYPE.COMPANY,
		corporation: "",
		name: "",
		address: "",
		contact: "",
		remark: "",
		...getMongodbBase(),
	};
}

export const useSubjectStore = defineStore("Subject", {
	state: () => ({
		subjectPicked: getSchema() as Subject,
		subjectEditor: getSchema() as Subject,
		subjectList: [] as Subject[],

		dialogPost: false,
		dialogPost2: false,
		dialogPatch: false,
		dialogPatch2: false,
	}),
	actions: {
		async get() {
			const dto: getSubjectDto = null;
			const res: getSubjectRes = await request.get(SUBJECT_PATH);
			this.subjectList = res.list;
		},
		async post() {
			try {
				const dto: postSubjectDto = this.subjectEditor;
				const res: postSubjectRes = await request.post(SUBJECT_PATH, { dto });
				await this.get();
				this.dialogPost = false;
				this.dialogPost2 = false;
				SnackbarStore.setSuccess("添加成功");
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			}
		},
		async patch() {
			try {
				const dto: patchSubjectDto = this.subjectEditor;
				const res: patchSubjectRes = await request.patch(SUBJECT_PATH, { dto });
				await this.get();
				this.dialogPatch = false;
				this.dialogPatch2 = false;
				SnackbarStore.setSuccess("修改成功");
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			}
		},
		async delete(subject: Subject) {
			try {
				const answer = window.confirm(`确定要删除 @${subject.name} 吗？`);
				if (!answer) return;
				const dto: deleteSubjectDto = { subjectId: subject._id };
				const res: deleteSubjectRes = await request.delete(SUBJECT_PATH, { dto });
				await this.get();
				SnackbarStore.setSuccess("删除成功");
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			}
		},
		async pick(subject: Subject) {
			try {
				if (!subject) throw new Error(`请选择正确的公司`);
				this.subjectPicked = subject;
				localStorage.setItem("qqlx-subject-id", this.subjectPicked._id);
				await SubjectRoleStore.get();

				SnackbarStore.setSuccess(`切换 @${this.subjectPicked.name} 成功`);
				document.title = `开单办公室-${subject.name}`;
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			}
		},
		edit(subject?: Subject) {
			this.setSchema();
			if (subject) {
				this.subjectEditor = JSON.parse(JSON.stringify(subject));
			}
		},
		getSchema() {
			const schema: Subject = getSchema();
			return schema;
		},
		setSchema() {
			this.subjectEditor = this.getSchema();
		},
	},
});
