<template>
    <q-layout container view="lHh Lpr lff">
        <q-drawer side="left" :width="180" show-if-above class="select-none hide-scrollbar shadow-15">
            <div class="text-weight-bold text-h5 q-pl-md q-py-md text-primary cursor-pointer" @click="goHome()">
                <div>
                    <span style="position: relative; margin-left: -2px" class="q-pr-md q-pt-xs">
                        黑石系统
                        <!-- <q-badge floating color="negative">销售</q-badge> -->
                    </span>
                </div>
                <div class="text-caption">钢材行业专用@{{ version }}</div>
            </div>

            <!-- 个人中心 -->
            <!-- 个人中心 -->
            <q-item clickable class="q-mb-sm q-px-sm bg-primary text-white" @click="$router.push('/wmss/system/setting')">
                <q-item-section avatar>
                    <q-avatar>
                        <img :src="UserStore.userEditor?.avator || UserStore.wxAvatorDefault" />
                        <q-badge color="negative" floating v-if="MarketScoAnalysisStore.isOverdue">已过期</q-badge>
                        <q-badge color="amber" floating v-else>VIP</q-badge>
                    </q-avatar>
                </q-item-section>
                <q-item-section>
                    <q-item-label class="text-weight-bold ellipsis">{{ UserStore.userEditor?.nickname }}</q-item-label>
                    <q-item-label class="text-caption ellipsis">{{ CorpStore.picked?.name || "-" }}</q-item-label>
                </q-item-section>
            </q-item>

            <!-- 导航 -->
            <!-- 导航 -->
            <q-list v-for="(container, index) in routes">
                <div v-if="container.name" class="text-caption text-grey-13 q-pt-md q-px-md q-pb-sm">{{ container.name }}</div>
                <router-link
                    v-for="route in container.children?.filter((e) => e.meta?.show)"
                    :to="`/wmss/${container.path}/${route.path}`"
                    v-slot="{ isActive }"
                >
                    <q-item clickable :active="isActive" class="text-primary q-pa-none q-pl-md" :class="{ 'bg-primary': isActive, 'text-white': isActive }">
                        <q-item-section side :class="{ 'text-primary': !isActive, 'text-white': isActive }">
                            <q-icon :name="(route.meta?.icon as string)"> </q-icon>
                        </q-item-section>
                        <q-item-section class="text-weight-bold text-body1" :class="{ 'text-primary': !isActive, 'text-white': isActive }">
                            <q-item-label style="position: relative">
                                <span>
                                    {{ route.name }}
                                    <q-badge v-if="route.meta?.badge" color="negative" style="transform: translateY(-2px)">{{ route.meta?.badge }}</q-badge>
                                    <!-- <q-badge  color="negative" v-if="skuNotConfirmedAll > 0 && route.path === 'sku-list'">
                                        {{ skuNotConfirmedAll }}
                                    </q-badge> -->
                                </span>
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                </router-link>
            </q-list>
        </q-drawer>

        <q-page-container>
            <q-page class="bg-blue-grey-1">
                <!-- 店铺公告 -->
                <div class="bg-orange row items-center" v-if="brandAnnounceShow && AnnounceStore.list.length">
                    <div class="col-10 q-pl-lg">
                        <q-carousel v-model="swiperIndex" vertical animated infinite :autoplay="4000" height="40px">
                            <q-carousel-slide
                                v-for="(announce, index) in AnnounceStore.list"
                                :name="index"
                                class="row bg-orange items-center no-wrap q-pa-none"
                            >
                                <q-icon name="campaign" size="22px" class="q-mr-md"></q-icon>
                                <span class="ellipsis text-body1">{{ announce.content }}</span>
                            </q-carousel-slide>
                        </q-carousel>
                    </div>
                    <div class="col-2 text-right q-pr-sm">
                        <q-icon name="close" size="22px" class="cursor-pointer" @click="brandAnnounceShow = false"></q-icon>
                    </div>
                </div>

                <!-- 主页面 -->
                <div class="q-px-lg q-pt-xl">
                    <router-view />
                </div>

                <div class="q-px-lg q-pt-xl q-pb-xl text-grey text-center row justify-center items-center">
                    <div class="bg-primary"></div>
                    <div class="text-center">
                        <div class="text-bold q-pb-xs">黑石（钢材）销售系统</div>
                        <div>清泉流响 · 软件信息有限责任公司</div>
                    </div>
                </div>
            </q-page>
        </q-page-container>

        <!-- 全局组件 -->
        <dialog-plate-sku-list />
    </q-layout>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getRangeMonth } from "qqlx-cdk";

import dialogPlateSkuList from "@/components/dialog-plate-sku-list.vue";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useUserStore } from "@/stores/user/user";
import { useCorpStore } from "@/stores/brand/corp";
import { useMarketScoAnalysisStore } from "@/stores/market/analysis";
import { useAnnounceStore } from "@/stores/brand/announce";
import { useCabinetStore } from "@/stores/wmss/cabinet";
import { useAreaStore } from "@/stores/brand/area";

const router = useRouter();
const routes = router.options.routes[0].children;

const NotifyStore = useNotifyStore();
const UserStore = useUserStore();
const MarketScoAnalysisStore = useMarketScoAnalysisStore();
const CorpStore = useCorpStore();
const AnnounceStore = useAnnounceStore();
const CabinetStore = useCabinetStore();
const AreaStore = useAreaStore();

const swiperIndex = ref(0);
const brandAnnounceShow = ref(true);
const userDialog = ref(false);

const goHome = () => window.open("https://qqlx.tech");
const version = computed(() => {
    const date = new Date();
    const year = date.getFullYear() - 2020;
    const month = date.getMonth() + 1;
    const week = Math.ceil((Date.now() - getRangeMonth().startTime) / (86400000 * 7));
    return `${year}.${month}.${week}`;
});
const nowCorpName = computed(() => CorpStore.picked?.name || "-");
onMounted(async () => {
    try {
        // user
        await UserStore.transformAuthorization();
        // brand
        await CorpStore.get();
        const corpIdPicked = localStorage.getItem("qqlx-corp-id");
        const match = CorpStore.list.find((e) => e._id === corpIdPicked);
        const first = CorpStore.list.find((e) => e.isDisabled === false);
        CorpStore.pick(match || first);
        // AnnounceStore.get();
        // AreaStore.get();
        // market
        MarketScoAnalysisStore.get();
        // wmss
        // CabinetStore.get();
    } catch (error) {
        NotifyStore.fail((error as Error).message);
    }
});
</script>

<style scoped lang="scss"></style>
