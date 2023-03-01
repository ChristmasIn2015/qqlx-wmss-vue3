import { defineStore } from "pinia";
import { cloneDeep } from "lodash";
import { Notify, useQuasar } from "quasar";

import { ENUM_POUNDS_FORMULA, MAP_ENUM_POUNDS_FORMULA, ENUM_LAYOUT_CABINET, MAP_ENUM_LAYOUT_CABINET, PATH_CONFIG_CORP } from "qqlx-core";
import type { getConfigCorpDto, getConfigCorpRes, postConfigCorpDto, postConfigCorpRes } from "qqlx-core/dto/brand/configCorp";
import type { User } from "qqlx-core/schema/user/user";
import type { ConfigCorp } from "qqlx-core/schema/brand/configCorp";

import { getMongodbBase, request } from "@/utils";
import { useNotifyStore } from "@/stores/notify";

const NotifyStore = useNotifyStore();

function getSchema(): ConfigCorp {
	return {
		corpId: "",
		titles: "",
		...getMongodbBase(),
	};
}

export const useConfigCorp = defineStore("ConfigCorp", {
	state: () => ({
		editor: getSchema() as ConfigCorp,
		titles: [] as { text: string }[],
		loadding: false,
	}),
	actions: {
		async get() {
			const dto: getConfigCorpDto = null;
			const res: getConfigCorpRes = await request.get(PATH_CONFIG_CORP);
			this.editor = res;

			this.titles = res.titles.split(",").map((e) => ({ text: e }));
		},
		async post() {
			try {
				this.loadding = true;
				this.editor.titles = this.titles.map((e) => e.text).toString();
				const dto: postConfigCorpDto = this.editor;
				const res: postConfigCorpRes = await request.post(PATH_CONFIG_CORP, { dto });
				await this.get();

				NotifyStore.success("保存成功");
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			} finally {
				this.loadding = false;
			}
		},
		getSchema() {
			const schema: ConfigCorp = getSchema();
			return schema;
		},
		setSchema(entity?: ConfigCorp) {
			const schema = cloneDeep(entity || this.getSchema());
			this.editor = schema;
		},
	},
});
