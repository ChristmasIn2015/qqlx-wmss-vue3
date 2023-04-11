import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { getMongodbBase } from "qqlx-cdk";
import { PATH_BRAND_WAREHOUSE } from "qqlx-core";

import type { postWarehouseDto, postWarehouseRes, getWarehouseDto, getWarehouseRes, patchWarehouseDto, patchWarehouseRes, Warehouse } from "qqlx-core";

import { request } from "@/lib";
import { useNotifyStore } from "@/stores/quasar/notify";
const NotifyStore = useNotifyStore();

function getSchema(): Warehouse {
    return {
        corpId: "",
        name: "",
        address: "",
        isDisabled: false,
        ...getMongodbBase(),
    };
}

export const useWarehouseStore = defineStore("Warehouse", {
    state: () => ({
        picked: getSchema(),
        editor: getSchema(),
        list: [] as Warehouse[],
    }),
    actions: {
        async get() {
            const dto: getWarehouseDto = null;
            const res: getWarehouseRes = await request.get(PATH_BRAND_WAREHOUSE);
            this.list = res;
        },
        /** @viewcatch */
        async post() {
            try {
                const dto: postWarehouseDto = this.editor;
                const res: postWarehouseRes = await request.post(PATH_BRAND_WAREHOUSE, { dto });
                await this.get();
                NotifyStore.success("添加成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            }
        },
        /** @viewcatch */
        async patch() {
            try {
                const dto: patchWarehouseDto = this.editor;
                const res: patchWarehouseRes = await request.patch(PATH_BRAND_WAREHOUSE, { dto });
                await this.get();
                NotifyStore.success("修改成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            }
        },
        pick(house?: Warehouse) {
            if (!house) return;
            this.picked = cloneDeep(house);
            NotifyStore.success(`切换 @${this.picked.name} 成功`);
        },
        getSchema() {
            const schema: Warehouse = getSchema();
            return schema;
        },
        setEditor(target?: Warehouse) {
            const schema = target ? cloneDeep(target) : this.getSchema();
            this.editor = schema;
        },
    },
});
