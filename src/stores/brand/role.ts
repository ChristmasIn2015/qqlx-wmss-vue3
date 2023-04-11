import { defineStore } from "pinia";

import { getMongodbBase, getPage, MongodbSort } from "qqlx-cdk";
import { ENUM_BRAND_ROLE, MAP_ENUM_BRAND_ROLE, PATH_BRAND_ROLE } from "qqlx-core";

import type {
    getBrandRoleDto,
    getBrandRoleRes,
    postBrandRoleDto,
    postBrandRoleRes,
    deleteBrandRoleDto,
    deleteBrandRoleRes,
    BrandRole,
    BrandRoleJoined,
} from "qqlx-core";

import { request } from "@/lib";
import { useNotifyStore } from "@/stores/quasar/notify";
import { cloneDeep } from "lodash";
const NotifyStore = useNotifyStore();

function getSchema(): BrandRole {
    return {
        corpId: "",
        userId: "",
        role: ENUM_BRAND_ROLE.TRAINEE,
        ...getMongodbBase(),
    };
}

export const useBrandRoleStore = defineStore("BrandRole", {
    state: () => ({
        BrandRoleEnumIndexNow: 0,
        //
        editor: getSchema(),
        list: [] as BrandRoleJoined[],
    }),
    actions: {
        async get() {
            const dto: getBrandRoleDto = null;
            const res: getBrandRoleRes = await request.get(PATH_BRAND_ROLE);
            this.list = res?.reverse();
        },
        /** @viewcatch */
        async post(askerId: string, role?: ENUM_BRAND_ROLE) {
            try {
                const schema = this.getSchema();
                schema.userId = askerId;
                if (role) schema.role = role;
                const dto: postBrandRoleDto = schema;
                const res: postBrandRoleRes = await request.post(PATH_BRAND_ROLE, { dto });

                await this.get();
                NotifyStore.success("成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            }
        },
        /** @viewcatch */
        async delete(entityId: string) {
            try {
                const dto: deleteBrandRoleDto = { entityId };
                const res: deleteBrandRoleRes = await request.delete(PATH_BRAND_ROLE, { dto });
                await this.get();
                NotifyStore.success("删除成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            }
        },
        getSchema() {
            const schema: BrandRole = getSchema();
            return schema;
        },
        setEditor(entity?: BrandRole) {
            const schema: BrandRole = cloneDeep(entity || getSchema());
            this.editor = schema;
        },
    },
});
