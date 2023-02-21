import { defineStore } from "pinia";
import { cloneDeep, debounce } from "lodash";

import { PATH_ANALYSIS } from "qqlx-core";
import type { getAnalysisDto, getAnalysisRes } from "qqlx-core/dto/wmss/analysis";
import type { MongodbPage } from "qqlx-core/utils/database";
import type { Contact } from "qqlx-core/schema/brand/contact";
import type { ENUM_ORDER } from "qqlx-core/schema/wmss/order";

import { getMongodbBase, request, getPage } from "@/utils";
import { useNotifyStore } from "@/stores/notify";

const NotifyStore = useNotifyStore();

export const useAnalysisStore = defineStore("Analysis", {
	state: () => ({
		skuNotConfirmed: [] as { type: ENUM_ORDER; count: number }[],
	}),
	actions: {
		async get() {
			try {
				const dto: getAnalysisDto = null;
				const res: getAnalysisRes = await request.get(PATH_ANALYSIS, { dto });
				console.log(res.skuNotConfirmed);
				this.skuNotConfirmed = res.skuNotConfirmed;
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			}
		},
	},
});
