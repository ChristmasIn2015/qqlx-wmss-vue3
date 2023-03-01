import { defineStore } from "pinia";
import { cloneDeep } from "lodash";
import { Notify, useQuasar } from "quasar";

import { ENUM_POUNDS_FORMULA, MAP_ENUM_POUNDS_FORMULA, ENUM_LAYOUT_CABINET, MAP_ENUM_LAYOUT_CABINET, PATH_ANNOUNCE } from "qqlx-core";
import type {
	getAnnounceDto,
	getAnnounceRes,
	postAnnounceDto,
	postAnnounceRes,
	patchAnnounceDto,
	patchAnnounceRes,
	deleteAnnounceDto,
	deleteAnnounceRes,
} from "qqlx-core/dto/brand/announce";
import type { User } from "qqlx-core/schema/user/user";
import type { Announce } from "qqlx-core/schema/brand/announce";

import { getMongodbBase, request } from "@/utils";
import { useNotifyStore } from "@/stores/notify";

const NotifyStore = useNotifyStore();

function getSchema(): Announce {
	return {
		corpId: "",
		content: "",
		...getMongodbBase(),
	};
}

export const useAnnounce = defineStore("Announce", {
	state: () => ({
		editor: getSchema() as Announce,
		list: [] as Announce[],
		loadding: false,
	}),
	actions: {
		async get() {
			const dto: getAnnounceDto = null;
			const res: getAnnounceRes = await request.get(PATH_ANNOUNCE);
			this.list = res;
		},
		async post() {
			try {
				this.loadding = true;
				const dto: postAnnounceDto = this.getSchema();
				const res: postAnnounceRes = await request.post(PATH_ANNOUNCE, { dto });
				await this.get();

				NotifyStore.success("创建成功");
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			} finally {
				this.loadding = false;
			}
		},
		async patch(entity: Announce) {
			try {
				this.loadding = true;
				const dto: patchAnnounceDto = entity;
				const res: patchAnnounceRes = await request.patch(PATH_ANNOUNCE, { dto });
				await this.get();
				NotifyStore.success("修改成功");
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			} finally {
				this.loadding = false;
			}
		},
		async delete(entity: Announce) {
			try {
				const dto: deleteAnnounceDto = entity;
				const res: deleteAnnounceRes = await request.delete(PATH_ANNOUNCE, { dto });
				await this.get();
				NotifyStore.success("删除成功");
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			}
		},
		getSchema() {
			const schema: Announce = getSchema();
			return schema;
		},
		setSchema(entity?: Announce) {
			const schema = cloneDeep(entity || this.getSchema());
			this.editor = schema;
		},
	},
});
