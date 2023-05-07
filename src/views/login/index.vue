<template>
    <div class="full-height color-back-main row justify-center items-center">
        <div class="text-white column q-mr-xl q-pt-xs" style="max-width: 600px; height: 430px">
            <div class="text-h2 text-weight-bold">欢迎使用，钢材办公室</div>
            <div class="q-pt-sm"></div>
            <div class="text-h5">QingQuan Warehouse Management System</div>

            <div class="text-body1 q-mt-lg">
                <div>本产品主要用于钢材贸易、加工型企业</div>
                <div>* 可统计客户回款、开票信息</div>
                <div>* 销售时可快速挑选产品进行开单、打印</div>
                <div>* 支持原材料领料、加工，及其之后的库存自动计算</div>
                <div>* 支持办公室中多人多角色分配，以确保有效的工作流程和高效的团队合作</div>
            </div>

            <div class="text-body1 q-mt-lg">
                <div>@清泉流响·软件信息有限责任公司</div>
                <div>系统已运行 {{ time }}</div>
            </div>
        </div>

        <div>
            <q-card class="q-pt-lg text-center w-400">
                <div id="wx-login"></div>
            </q-card>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getTimeGap } from "qqlx-cdk";

import { useUserStore } from "@/stores/user/user";
import { useBrandRoleStore } from "@/stores/brand/role";
import { useNotifyStore } from "@/stores/quasar/notify";

const time = ref("");
const route = useRoute();
const NotifyStore = useNotifyStore();
const UserStore = useUserStore();
const BrandRoleStore = useBrandRoleStore();

onMounted(async () => {
    const code = route.query.code as string;
    const state = route.query.state as string;

    try {
        // 登录
        if (state === "LOGIN" && code) {
            await UserStore.post(code);
            window.location.assign("/wmss/analysis/dashboard");
        }
        // 加入店铺
        else if (state === "JOIN" && code) {
            const res = await UserStore.get(code);
            BrandRoleStore.setEditor();
            await BrandRoleStore.post(res.userId);
            window.location.assign("/wmss/analysis/dashboard");
        }
    } catch (error) {
        NotifyStore.fail((error as Error).message);
    }

    // 渲染微信登录二维码
    setTimeout(() => {
        const WxLogin = window.WxLogin as any;
        WxLogin &&
            document.getElementById("wx-login") &&
            new WxLogin({
                id: "wx-login",
                appid: "wxd0e6ee13822ccb7f",
                scope: "snsapi_login",
                redirect_uri: "http://qqlx.tech/wmss/login",
                state: "LOGIN",
            });
    }, 500);

    // 广告
    const start = new Date(`2021/06/01 08:35:26`).getTime();
    if (window.loginTimer) clearInterval(window.loginTimer);
    window.loginTimer = setInterval(() => (time.value = getTimeGap(Date.now(), start)), 1000);
});
</script>

<style lang="scss"></style>
