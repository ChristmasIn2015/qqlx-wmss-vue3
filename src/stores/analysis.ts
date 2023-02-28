import { defineStore } from "pinia";
import { cloneDeep, debounce } from "lodash";

import { PATH_ANALYSIS } from "qqlx-core";
import type { getAnalysisDto, getAnalysisRes, getOrderAnalysisDto, getOrderAnalysisRes } from "qqlx-core/dto/wmss/analysis";
import type { MongodbPage } from "qqlx-core/utils/database";
import type { Contact } from "qqlx-core/schema/brand/contact";
import type { ENUM_ORDER } from "qqlx-core/schema/wmss/order";
import type { ScheduleCardOrderJoined } from "qqlx-core/dto/market/scheduleCardOrder";

import { getMongodbBase, request, getPage, getTimeGap } from "@/utils";
import { useNotifyStore } from "@/stores/notify";

const NotifyStore = useNotifyStore();

export const useAnalysisStore = defineStore("Analysis", {
	state: () => ({
		timeQuasarPicked: { from: `${new Date().getFullYear()}/01/01`, to: new Date().toLocaleString().split(" ")[0] },
		page: getPage(15),
		loadding: false,
		analysis: {
			// 未处理的SKU计算
			skuNotConfirmed: [] as { type: ENUM_ORDER; count: number }[],
			coutIndividualSkuNotConfirmed: 0,
			// 最后的已支付订单
			lastActiveScheduleCardOrder: {} as ScheduleCardOrderJoined,
		},
		orderAnalysis: {
			// 销售订单
			countSaleOrder: 0,
			amountSaleOrder: 0,
			// 仓库订单
			countGetInOrder: 0,
			countGetOutOrder: 0,
			countMaterialOrder: 0,
			countProcessOrder: 0,
			// 收到货款
			amountBook_1122_DAI: 0,
			// 开出发票
			amountInvoice_1122_JIE: 0,
		},
	}),
	actions: {
		async get() {
			try {
				this.loadding = true;
				const dto: getAnalysisDto = { startTime: this.page.startTime, endTime: this.page.endTime };
				const res: getAnalysisRes = await request.get(PATH_ANALYSIS, { dto });

				this.analysis = res;
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			} finally {
				this.loadding = false;
			}
		},
		async getOrder() {
			try {
				this.loadding = true;
				const dto: getOrderAnalysisDto = { startTime: this.page.startTime, endTime: this.page.endTime };
				const res: getOrderAnalysisRes = await request.get(PATH_ANALYSIS + "/order", { dto });

				this.orderAnalysis = res;
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			} finally {
				this.loadding = false;
			}
		},
		timeChange() {
			if (this.timeQuasarPicked) {
				this.page.startTime = new Date(this.timeQuasarPicked.from + " 00:00:00").getTime();
				this.page.endTime = new Date(this.timeQuasarPicked.to + " 23:59:59").getTime();
				this.get();
				this.getOrder();
			}
		},
	},
});
