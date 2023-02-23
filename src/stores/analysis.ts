import { defineStore } from "pinia";
import { cloneDeep, debounce } from "lodash";

import { PATH_ANALYSIS } from "qqlx-core";
import type { getAnalysisDto, getAnalysisRes } from "qqlx-core/dto/wmss/analysis";
import type { MongodbPage } from "qqlx-core/utils/database";
import type { Contact } from "qqlx-core/schema/brand/contact";
import type { ENUM_ORDER } from "qqlx-core/schema/wmss/order";
import type { ScheduleCardOrderJoined } from "qqlx-core/dto/market/scheduleCardOrder";

import { getMongodbBase, request, getPage, getTimeGap } from "@/utils";
import { useNotifyStore } from "@/stores/notify";

const NotifyStore = useNotifyStore();

export const useAnalysisStore = defineStore("Analysis", {
	state: () => ({
		skuNotConfirmed: [] as { type: ENUM_ORDER; count: number }[],
		lastActiveScheduleCardOrder: {} as ScheduleCardOrderJoined,
	}),
	actions: {
		async get() {
			try {
				const dto: getAnalysisDto = null;
				const res: getAnalysisRes = await request.get(PATH_ANALYSIS, { dto });
				this.skuNotConfirmed = res.skuNotConfirmed;
				this.lastActiveScheduleCardOrder = res.lastActiveScheduleCardOrder;
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			}
		},
	},
});
