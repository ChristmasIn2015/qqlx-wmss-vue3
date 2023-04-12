import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { getMongodbBase, getPage, MongodbSort } from "qqlx-cdk";
import type { Page } from "qqlx-cdk";
import { PATH_CABINET_UNIT } from "qqlx-core";
import type {
    postCabinetUnitDto,
    postCabinetUnitRes,
    getCabinetUnitDto,
    getCabinetUnitRes,
    patchCabinetUnitDto,
    patchCabinetUnitRes,
    deleteCabinetUnitDto,
    deleteCabinetUnitRes,
    CabinetUnitJoined,
    Cabinet,
    CabinetUnit,
} from "qqlx-core";

import { request } from "@/lib";
import { useNotifyStore } from "@/stores/quasar/notify";
const NotifyStore = useNotifyStore();

function getSchema(): CabinetUnit {
    return {
        corpId: "",
        cabinetId: "",
        name: "",
        norm: "",
        poundsFinal: 0,
        countFinal: 0,
        price: 0,
        ...getMongodbBase(),
    };
}

export const useCabinetUnitStore = defineStore("CabinetUnit", {
    state: () => ({
        search: getSchema() as CabinetUnit,
        editor: getSchema() as CabinetUnit,
        list: [] as CabinetUnitJoined[],
        listPicked: [] as CabinetUnitJoined[],
        listExcel: [] as CabinetUnit[],

        sortKey: "timeCreate",
        sortValue: MongodbSort.DES,
        page: getPage(15) as Page,
        total: 0,
        loadding: false,
    }),
    actions: {
        /** @viewcatch */
        async get(cabinet: Cabinet, page?: number) {
            try {
                // 分页
                if (page && page > 0) this.page.page = page;
                this.loadding = true;

                // 数据加载
                this.search.cabinetId = cabinet._id;
                const dto: getCabinetUnitDto = {
                    page: this.page,
                    search: this.search,
                    sortKey: this.sortKey,
                    sortValue: this.sortValue,
                };
                const res: getCabinetUnitRes = await request.get(PATH_CABINET_UNIT, { dto });
                this.list = res.list;
                this.total = res.total;
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            } finally {
                this.loadding = false;
            }
        },
        sort(cabinet: Cabinet, sortKey: string) {
            if (sortKey) {
                this.sortKey = sortKey;
            } else {
                this.sortKey = "timeCreate";
            }
            this.sortValue = this.sortValue === MongodbSort.DES ? MongodbSort.ASC : MongodbSort.DES;
            this.get(cabinet, 1); // async
        },
        /** @viewcatch */
        async post(cabinet: Cabinet) {
            try {
                this.loadding = true;
                const excels = cloneDeep(this.listExcel);
                while (excels.length > 0) {
                    const dto: postCabinetUnitDto = {
                        cabinet,
                        excels: excels.splice(0, 80),
                    };
                    const res: postCabinetUnitRes = await request.post(PATH_CABINET_UNIT, { dto });
                }

                this.setEditor();
                this.listExcel = [];
                await this.get(cabinet, 1);
                NotifyStore.success("添加成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            } finally {
                this.loadding = false;
            }
        },
        /** @viewcatch */
        async patch(cabinet: Cabinet, price: number) {
            try {
                const list = JSON.parse(JSON.stringify(this.listPicked)) as CabinetUnit[];
                list.forEach((e) => (e.price = Number(price) || 0));
                const dto: patchCabinetUnitDto = { excels: list };
                const res: patchCabinetUnitRes = await request.patch(PATH_CABINET_UNIT, { dto });
                this.listPicked = [];

                await this.get(cabinet, 1);
                NotifyStore.success("修改成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            }
        },
        /** @viewcatch */
        async delete(cabinet: Cabinet) {
            try {
                for (let unit of this.listPicked) {
                    const dto: deleteCabinetUnitDto = { cabinetUnitId: unit._id };
                    const res: deleteCabinetUnitRes = await request.delete(PATH_CABINET_UNIT, { dto });
                }
                this.listPicked = [];
                await this.get(cabinet, 1);

                NotifyStore.success("删除成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            }
        },
        getSchema() {
            const schema: CabinetUnit = getSchema();
            return schema;
        },
        setEditor(entity?: CabinetUnit) {
            const schema = entity ? cloneDeep(entity) : this.getSchema();
            this.editor = schema;
        },
    },
});
