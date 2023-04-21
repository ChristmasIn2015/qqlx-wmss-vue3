<template>
    <q-card class="row items-center bg-transparent no-shadow q-pl-md" square>
        <q-icon name="quiz" size="18px" class="q-mr-sm" color="primary"></q-icon>
        <q-carousel v-model="IntroGroupStore.swiperIndex" class="bg-transparent" vertical animated infinite :autoplay="4000" height="40px">
            <q-carousel-slide
                class="row items-center no-wrap q-pa-none cursor-pointer"
                v-for="(group, index) in [...IntroGroupStore.listMatched, ...IntroGroupStore.list]"
                :name="index"
                @click="IntroGroupStore.pick(group)"
            >
                <span class="ellipsis text-body1">{{ group.joinIntros[0]?.content }}</span>
            </q-carousel-slide>
        </q-carousel>
    </q-card>

    <q-dialog v-model="IntroGroupStore.dialog">
        <q-card class="q-mr-sm">
            <q-list>
                <q-item
                    clickable
                    v-for="group of IntroGroupStore.listMatched.concat(IntroGroupStore.list)"
                    :class="{
                        'bg-primary': IntroGroupStore.picked?._id === group._id,
                        'text-white': IntroGroupStore.picked?._id === group._id,
                    }"
                    @click="IntroGroupStore.pick(group)"
                >
                    <q-item-section>{{ group.joinIntros?.find((e) => e.type === ENUM_INTRO.TITLE)?.content }}</q-item-section>
                </q-item>
            </q-list>
        </q-card>
        <q-card class="w-1000">
            <q-card-section>
                <div v-for="intro of IntroGroupStore.picked?.joinIntros">
                    <div v-if="intro.type === ENUM_INTRO.TITLE" class="text-h6">{{ intro.content }}</div>
                    <div v-else-if="intro.type === ENUM_INTRO.DESC" class="">{{ intro.content }}</div>
                    <div v-else-if="intro.type === ENUM_INTRO.IMAGE" class="">
                        <q-img :src="intro.content" class="q-my-sm q-mb-lg shadow-5"></q-img>
                    </div>
                </div>
            </q-card-section>
            <q-card-actions>
                <q-space></q-space>
                <q-btn v-close-popup>我知道了</q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useIntroGroupStore } from "@/stores/market/introGroup";

import { ENUM_INTRO } from "qqlx-core";

const IntroGroupStore = useIntroGroupStore();
const router = useRouter();
onMounted(async () => {
    const currentRoute = router.currentRoute.value;
    IntroGroupStore.get(currentRoute.path);
});
</script>
