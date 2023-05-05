<template>
    <q-card class="row items-center bg-transparent no-shadow q-pl-md" square>
        <q-icon name="quiz" size="18px" class="q-mr-sm" color="primary"></q-icon>
        <q-carousel
            v-model="IntroGroupStore.swiperIndex"
            class="bg-transparent"
            vertical
            animated
            infinite
            :autoplay="IntroGroupStore.dialog ? false : 4000"
            height="40px"
        >
            <q-carousel-slide
                class="row items-center no-wrap q-pa-none cursor-pointer"
                v-for="(group, index) in IntroGroupStore.list"
                :name="index"
                @click="IntroGroupStore.pick(group)"
            >
                <span class="ellipsis text-body1">{{ group.joinIntros[0]?.content }}</span>
            </q-carousel-slide>
        </q-carousel>
    </q-card>

    <q-dialog v-model="IntroGroupStore.dialog">
        <div class="w-1000">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title class="text-weight-bold">说明手册</q-toolbar-title>
                <q-btn dense flat icon="close" v-close-popup></q-btn>
            </q-toolbar>
            <q-card square style="height: 600px" class="scroll">
                <q-separator class="q-mb-md" />
                <q-splitter v-model="splitter">
                    <template v-slot:before>
                        <q-tabs v-model="IntroGroupStore.swiperIndex" vertical>
                            <q-tab
                                v-for="(group, index) of IntroGroupStore.list"
                                :name="index"
                                :label="group.joinIntros?.find((e) => e.type === ENUM_INTRO.TITLE)?.content"
                            />
                        </q-tabs>
                    </template>

                    <template v-slot:after>
                        <q-card v-if="nowIntro" class="scroll">
                            <q-card-section>
                                <div v-for="intro of nowIntro?.joinIntros">
                                    <div v-if="intro.type === ENUM_INTRO.TITLE" class="text-h6">{{ intro.content }}</div>
                                    <div v-else-if="intro.type === ENUM_INTRO.DESC" class="">{{ intro.content }}</div>
                                    <div v-else-if="intro.type === ENUM_INTRO.IMAGE" class="">
                                        <q-img :src="intro.content" class="q-my-sm q-mb-lg shadow-5"></q-img>
                                    </div>
                                </div>
                            </q-card-section>
                        </q-card>
                    </template>
                </q-splitter>
            </q-card>
        </div>
    </q-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useIntroGroupStore } from "@/stores/market/introGroup";

import { ENUM_INTRO } from "qqlx-core";

const IntroGroupStore = useIntroGroupStore();
const splitter = ref(15);
const router = useRouter();
const nowIntro = computed(() => IntroGroupStore.list[IntroGroupStore.swiperIndex]);
onMounted(async () => {
    const currentRoute = router.currentRoute.value;
    IntroGroupStore.get(currentRoute.path);
});
</script>
