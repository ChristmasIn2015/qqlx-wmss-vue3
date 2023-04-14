import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { getMongodbBase, getPage, Page } from "qqlx-cdk";
import { ENUM_POUNDS_FORMULA, ENUM_PROJECT, MAP_ENUM_POUNDS_FORMULA, Order, PATH_WMSS_CLUE } from "qqlx-core";
import type { postClueDto, postClueRes, getClueDto, getClueRes, Clue } from "qqlx-core";

import { request } from "@/lib";
import { useNotifyStore } from "@/stores/quasar/notify";
const NotifyStore = useNotifyStore();

function getSchema(): Clue {
    return {
        corpId: "",
        scope: ENUM_PROJECT.KDBGS,
        content: "",
        ...getMongodbBase(),
    };
}

export const useClueStore = defineStore("ClueStore", {
    state: () => ({
        search: getSchema(),

        page: getPage(20),
        list: [] as Clue[],
        total: 0,
        loadding: false,
    }),
    actions: {
        async get(page?: number) {
            try {
                // 分页
                if (page && page > 0) this.page.page = page;
                this.loadding = true;

                // 数据加载
                const dto: getClueDto = {
                    page: this.page,
                    search: this.search,
                };
                const res: getClueRes = await request.get(PATH_WMSS_CLUE, { dto });
                this.list = res.list;
                this.total = res.total;
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            } finally {
                this.loadding = false;
            }
        },
        async post(order: Order) {
            try {
                this.loadding = true;
                const dto: postClueDto = { order };
                await request.post(PATH_WMSS_CLUE, { dto });
                await this.get();
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            } finally {
                this.loadding = false;
            }
        },
        getSchema() {
            const schema: Clue = getSchema();
            return schema;
        },
        setEditor(entity?: Clue) {
            const schema = cloneDeep(entity || this.getSchema());
        },
    },
});
