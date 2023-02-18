import { defineStore } from "pinia";
import { cloneDeep, debounce } from "lodash";

import { ENUM_CORP, PATH_CONTACT } from "qqlx-core";
import type {
	postContactDto,
	postContactRes,
	getContactDto,
	getContactRes,
	patchContactDto,
	patchContactRes,
	deleteContactDto,
	deleteContactRes,
} from "qqlx-core/dto/brand/contact";
import type { MongodbPage } from "qqlx-core/utils/database";
import type { Contact } from "qqlx-core/schema/brand/contact";

import { getMongodbBase, request, getPage } from "@/utils";
import { useNotifyStore } from "@/stores/notify";

const NotifyStore = useNotifyStore();

function getSchema(): Contact {
	return {
		corpId: "",
		isDisabled: false,
		name: "",
		address: "",
		remark: "",
		...getMongodbBase(),
	};
}

export const useContactStore = defineStore("Contact", {
	state: () => ({
		contactSearch: getSchema() as Contact,
		contactEditor: getSchema() as Contact,
		contactListExcel: [] as Contact[],
		contactList: [] as Contact[],

		page: getPage(20) as MongodbPage,
		total: 0,
		loadding: false,
	}),
	actions: {
		async get(page?: number) {
			try {
				// 分页
				if (page && page > 0) this.page.page = page;
				this.loadding = true;

				const dto: getContactDto = { page: this.page, search: this.contactSearch };
				const res: getContactRes = await request.get(PATH_CONTACT, { dto });
				this.contactList = this.page.page === 1 ? res.list : this.contactList.concat(res.list);
				this.total = res.total;

				if (res.list.length > 0) this.page.page++;
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			} finally {
				this.loadding = false;
			}
		},
		// async get10() {
		// 	try {
		// 		this.loadding = true;

		// 		const dto: getContactDto = { page: getPage(10), search: this.getSchema(), keyword: this.keyword };
		// 		const res: getContactRes = await request.get(PATH_CONTACT, { dto });
		// 		this.contactListKeyword = res.list.map((e) => ({ title: `${e.name} / ${e.remark}`, value: e._id }));
		// 	} catch (error) {
		// 		NotifyStore.fail((error as Error).message);
		// 	} finally {
		// 		this.loadding = false;
		// 	}
		// },
		async post() {
			try {
				const excels = cloneDeep(this.contactListExcel);
				while (excels.length > 0) {
					const dto: postContactDto = { excels: excels.splice(0, 80) };
					const res: postContactRes = await request.post(PATH_CONTACT, { dto });
				}
				await this.get(1);

				this.setSchema();
				this.contactListExcel = [];
				NotifyStore.success("添加成功");
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			}
		},
		async patch(contact?: Contact) {
			try {
				const target = contact || this.contactEditor;
				const dto: patchContactDto = target;
				const res: patchContactRes = await request.patch(PATH_CONTACT, { dto });

				this.setSchema();
				await this.get(1);
				NotifyStore.success("修改成功");
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			}
		},
		async delete(contactId: string) {
			try {
				const dto: deleteContactDto = { contactId };
				const res: deleteContactRes = await request.delete(PATH_CONTACT, { dto });
				await this.get(1);

				NotifyStore.success("删除成功");
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			}
		},
		getSchema() {
			const schema: Contact = getSchema();
			return schema;
		},
		setSchema(entity?: Contact) {
			const schema = entity ? cloneDeep(entity) : this.getSchema();
			this.contactEditor = schema;
			this.contactSearch = schema;
		},
	},
});
