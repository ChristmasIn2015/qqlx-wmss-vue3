import { defineStore } from "pinia";
import { cloneDeep, debounce } from "lodash";

import { MongodbSort, getMongodbBase, getPage, getTimeGap } from "qqlx-cdk";
import {
    PATH_ORDER_ANALYSIS,
    PATH_CONTACT_ANALYSIS,
    ENUM_ORDER,
    getOrderAnalysisDto,
    getOrderAnalysisRes,
    getContactAnalysisDto,
    getContactAnalysisRes,
    ContactAnalysisJoined,
    ContactAnalysis,
} from "qqlx-core";

import { request } from "@/lib";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useConfigStore } from "@/stores/brand/config";

const NotifyStore = useNotifyStore();
const Config = useConfigStore();

type ViewOrderAna = {
    startTime: number;
    endTime: number;
    text: string;
    calcu: Record<ENUM_ORDER, { amount: number; count: number }>;
};
function getSchema(): ContactAnalysis {
    return {
        corpId: "",
        contactId: "",
        type: ENUM_ORDER.NONE,
        count: 0,
        amountOrder: 0,
        amountBookOfOrder: 0,
        amountBookOfOrderRest: 0,
        amountBookOfOrderVAT: 0,
        amountBookOfOrderVATRest: 0,
        ...getMongodbBase(),
    };
}
export const useAnalysisStore = defineStore("Analysis", {
    state: () => ({
        listContact: [] as ContactAnalysisJoined[],
        total: 0,

        page: getPage(),
        search: getSchema(),
        sortKey: "amountOrder",
        sortValue: MongodbSort.DES,
        loadding: false,
    }),
    actions: {
        async set(dto: ViewOrderAna[]): Promise<ViewOrderAna[]> {
            this.loadding = true;
            const res: getOrderAnalysisRes = await request.get(PATH_ORDER_ANALYSIS, { dto });
            this.loadding = false;
            return dto.map((time, index) => ({ ...time, ...res[index] }));
        },
        async getContactAnalysis(page: number = 1) {
            try {
                this.loadding = true;

                if (page > 0) this.page.page = page;
                const dto: getContactAnalysisDto = {
                    page: this.page,
                    search: this.search,
                    sortKey: this.sortKey,
                    sortValue: this.sortValue,
                };
                const res: getContactAnalysisRes = await request.get(PATH_CONTACT_ANALYSIS, { dto });
                this.listContact = res.list;
                this.total = res.total;
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            } finally {
                this.loadding = false;
            }
        },
    },
});
