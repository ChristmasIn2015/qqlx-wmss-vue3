<template>
    <div class="q-pl-xs q-mb-sm">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <span>权限分配</span>
            <dialog-intro></dialog-intro>
            <q-space></q-space>
            <q-btn square color="negative" @click="openBrandRole()">加入我们</q-btn>
        </div>
    </div>

    <q-card class="q-py-md" square>
        <q-splitter v-model="splitIndex">
            <template v-slot:before>
                <q-tabs v-model="tabIndex" dense vertical class="text-primary">
                    <q-tab
                        class="q-my-md"
                        v-for="RoleOption in tabOptions"
                        :icon="RoleOption.icon"
                        :name="RoleOption.value"
                        :label="MAP_ENUM_BRAND_ROLE.get(RoleOption.value)?.text"
                    >
                    </q-tab>
                </q-tabs>
            </template>
            <template v-slot:after>
                <q-tab-panels v-model="tabIndex" animated>
                    <q-tab-panel v-for="RoleOption in tabOptions" :name="RoleOption.value" class="q-py-none">
                        <div v-for="Role in BrandRoleStore.list.filter((e) => [ENUM_BRAND_ROLE.TRAINEE, ENUM_BRAND_ROLE.ROOT].includes(e.role)).reverse()">
                            <q-item>
                                <q-item-section avatar>
                                    <q-avatar rounded v-if="Role.role === ENUM_BRAND_ROLE.ROOT">
                                        <img :src="Role.joinUserInfo?.avator || UserStore.wxAvatorDefault" />
                                        <q-badge floating>管理员</q-badge>
                                    </q-avatar>
                                    <q-avatar
                                        v-else-if="!!BrandRoleStore.list.filter((e) => e.userId === Role.userId).find((e) => e.role === RoleOption.value)"
                                        rounded
                                        class="cursor-pointer"
                                        @click="
                                            BrandRoleStore.delete(
                                                BrandRoleStore.list.filter((e) => e.userId === Role.userId).find((e) => e.role === RoleOption.value)
                                                    ?._id as string
                                            )
                                        "
                                    >
                                        <img :src="Role.joinUserInfo?.avator || UserStore.wxAvatorDefault" />
                                        <q-badge floating color="positive"> 已开启 </q-badge>
                                    </q-avatar>
                                    <q-avatar rounded v-else class="cursor-pointer" @click="BrandRoleStore.post(Role.joinUserInfo?.userId, RoleOption.value)">
                                        <img :src="Role.joinUserInfo?.avator || UserStore.wxAvatorDefault" />
                                        <q-badge floating color="negative"> 已关闭 </q-badge>
                                    </q-avatar>
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label class="text-weight-bold"> {{ Role.joinUserInfo?.nickname }} </q-item-label>
                                    <q-item-label class="text-weight-bold text-option"> -</q-item-label>
                                </q-item-section>
                                <q-item-section side>
                                    <q-item-label>
                                        <q-btn dense icon="more_horiz" flat>
                                            <q-menu>
                                                <q-list class="w-100">
                                                    <q-item
                                                        clickable
                                                        v-close-popup
                                                        :disable="Role.role === ENUM_BRAND_ROLE.ROOT"
                                                        @click="BrandRoleStore.delete(Role._id)"
                                                    >
                                                        <q-item-section class="text-negative">删除成员</q-item-section>
                                                    </q-item>
                                                </q-list>
                                            </q-menu>
                                        </q-btn>
                                    </q-item-label>
                                    <q-item-label caption> </q-item-label>
                                </q-item-section>
                            </q-item>
                            <q-separator></q-separator>
                        </div>
                    </q-tab-panel>
                </q-tab-panels>
            </template>
        </q-splitter>
    </q-card>
    <q-card class="q-mr-sm q-mb-sm" v-for="base in BrandRoleStore.list.filter((e) => e.role === ENUM_BRAND_ROLE.ENTERTAIN)">
        <q-item>
            <q-item-section avatar>
                <q-avatar rounded>
                    <img :src="base.joinUserInfo?.avator || UserStore.wxAvatorDefault" />
                </q-avatar>
            </q-item-section>
            <q-item-section>
                <q-item-label class="text-weight-bold"> {{ base.joinUserInfo?.nickname }} </q-item-label>
            </q-item-section>
            <q-item-section side>
                <q-item-label>
                    <q-btn dense icon="more_horiz" flat>
                        <q-menu>
                            <q-list class="w-100">
                                <q-item clickable v-close-popup @click="BrandRoleStore.delete(base._id)">
                                    <q-item-section class="text-negative">删除成员</q-item-section>
                                </q-item>
                            </q-list>
                        </q-menu>
                    </q-btn>
                </q-item-label>
                <q-item-label caption> </q-item-label>
            </q-item-section>
        </q-item>
    </q-card>

    <q-dialog v-model="dialogBrandRole">
        <div class="text-center">
            <q-card class="q-mt-xl q-pt-lg w-500">
                <div id="wx-login-join"></div>
            </q-card>
        </div>
    </q-dialog>
</template>

<script lang="ts" setup>
import type { BrandRole } from "qqlx-core";
import { onMounted, ref, computed } from "vue";
import { ENUM_BRAND_ROLE, MAP_ENUM_BRAND_ROLE } from "qqlx-core";

import dialogIntro from "@/components/dialog-intro.vue";
import { useUserStore } from "@/stores/user/user";
import { useCorpStore } from "@/stores/brand/corp";
import { useBrandRoleStore } from "@/stores/brand/role";

const UserStore = useUserStore();
const BrandRoleStore = useBrandRoleStore();

const splitIndex = ref(10);
const tabIndex = ref(ENUM_BRAND_ROLE.WM);
const tabOptions = ref([
    { icon: "construction", value: ENUM_BRAND_ROLE.WM },
    { icon: "shopping_cart", value: ENUM_BRAND_ROLE.PURCHASE },
    { icon: "phone_callback", value: ENUM_BRAND_ROLE.SALES },
    { icon: "add_card", value: ENUM_BRAND_ROLE.FINANCE },
]);

const dialogBrandRole = ref(false);
const openBrandRole = () => {
    dialogBrandRole.value = true;
    setTimeout(() => {
        const WxLogin = window.WxLogin as any;
        WxLogin &&
            document.getElementById("wx-login-join") &&
            new WxLogin({
                id: "wx-login-join",
                appid: "wxd0e6ee13822ccb7f",
                scope: "snsapi_login",
                redirect_uri: "http://qqlx.tech/wmss/login",
                state: `JOIN`,
            });
    }, 500);
};
const toggleBrandRole = async (base: BrandRole, exist: ENUM_BRAND_ROLE) => {
    const all = BrandRoleStore.list;
    const match = all.find((e) => e.role === exist && e.userId === base.userId);
    if (match) await BrandRoleStore.delete(match._id);
    else await BrandRoleStore.post(base.userId, exist);
};

// action
onMounted(() => BrandRoleStore.get());
</script>

<style scoped lang="scss"></style>
