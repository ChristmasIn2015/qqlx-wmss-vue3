<template>
    <q-layout container view="lHh Lpr lff">
        <q-drawer side="left" :width="180" show-if-above class="select-none hide-scrollbar shadow-15">
            <div class="text-weight-bold text-h5 q-pl-md q-py-md text-primary cursor-pointer" @click="goHome()">
                <div>钢材办公室</div>
                <div class="text-caption">钢材行业专用@{{ version }}</div>
            </div>

            <!-- 个人中心 -->
            <!-- 个人中心 -->
            <q-item clickable class="q-pl-md q-pr-sm q-mb-sm bg-primary text-white" @click="userDialog = true">
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
                <q-item-section side top>
                    <q-icon name="arrow_drop_down" color="white" />
                </q-item-section>
            </q-item>

            <q-dialog v-model="userDialog" persistent>
                <q-card class="w-400">
                    <q-toolbar class="bg-primary text-white">
                        <q-toolbar-title>个人信息</q-toolbar-title>

                        <q-btn flat dense icon="close" v-close-popup />
                    </q-toolbar>

                    <q-separator />

                    <q-card-section>
                        <q-input filled label="用户昵称" class="q-mb-sm" v-model="UserStore.userEditor.nickname">
                            <template v-slot:append>
                                <q-btn fab flat icon="save" color="primary" @click="UserStore.patch()">
                                    <q-tooltip class="text-body1"> 保存 </q-tooltip>
                                </q-btn>
                            </template>
                        </q-input>

                        <div class="q-px-sm">
                            <q-input readonly label="当前公司" class="q-mb-sm" v-model="nowCorpName">
                                <template v-slot:append>
                                    <q-btn fab flat v-close-popup icon="sync_alt" color="primary" @click="$router.push('/wmss/system/corp')">
                                        <q-tooltip class="text-body1"> 切换 </q-tooltip>
                                    </q-btn>
                                </template>
                            </q-input>

                            <q-input
                                readonly
                                label="有效期"
                                class="q-mb-sm"
                                v-model="MarketScoAnalysisStore.message"
                                :input-class="MarketScoAnalysisStore.isOverdue ? 'text-negative' : 'text-primary'"
                            >
                                <template v-slot:append>
                                    <q-btn fab flat v-close-popup icon="chevron_right" color="primary" @click="$router.push('/wmss/system/pay')">
                                        <q-tooltip class="text-body1">去充值</q-tooltip>
                                    </q-btn>
                                </template>
                            </q-input>
                        </div>
                    </q-card-section>

                    <q-card-actions>
                        <q-btn color="negative" flat v-close-popup @click="$router.push('/wmss/login')">
                            <q-icon name="logout"></q-icon>
                            <span class="q-ml-xs">退出</span>
                        </q-btn>
                        <q-space></q-space>
                    </q-card-actions>
                </q-card>
            </q-dialog>

            <!-- 导航 -->
            <!-- 导航 -->
            <q-list v-for="(container, index) in routes">
                <div v-if="container.name" class="text-caption text-grey-13 q-pa-md">{{ container.name }}</div>
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
                                    <!-- <q-badge style="transform: translateY(-2px)" color="negative" v-if="skuNotConfirmedAll > 0 && route.path === 'sku-list'">
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
                <div class="q-px-lg q-py-xl">
                    <router-view />
                </div>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getRangeMonth } from "qqlx-cdk";

import { useNotifyStore } from "@/stores/quasar/notify";
import { useUserStore } from "@/stores/user/user";
import { useCorpStore } from "@/stores/brand/corp";
import { useMarketScoAnalysisStore } from "@/stores/market/analysis";
import { useAnnounceStore } from "@/stores/brand/announce";
import { useIntroGroupStore } from "@/stores/market/introGroup";

const router = useRouter();
const routes = router.options.routes[0].children;

const NotifyStore = useNotifyStore();
const UserStore = useUserStore();
const CorpStore = useCorpStore();
const MarketScoAnalysisStore = useMarketScoAnalysisStore();
const IntroGroupStore = useIntroGroupStore();
const AnnounceStore = useAnnounceStore();

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
        // corp
        await CorpStore.get();
        const corpIdPicked = localStorage.getItem("qqlx-corp-id");
        const match = CorpStore.list.find((e) => e._id === corpIdPicked);
        const first = CorpStore.list.find((e) => e.isDisabled === false);
        CorpStore.pick(match || first);
        // config
        AnnounceStore.get();
        MarketScoAnalysisStore.get();
    } catch (error) {
        NotifyStore.fail((error as Error).message);
    }
});
</script>

<style scoped lang="scss"></style>
