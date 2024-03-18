<template>
    <q-dialog :model-value="dialog" persistent>
        <q-card class="w-1000">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>
                    <q-badge rounded color="teal" class="shadow-2 q-mr-sm"> </q-badge>
                    快速收款
                </q-toolbar-title>
                <q-btn dense flat icon="close" @click="$emit('close')">
                    <q-tooltip class="text-body1">重新开始</q-tooltip>
                </q-btn>
            </q-toolbar>

            <q-stepper v-model="step" ref="stepper" color="teal" animated>
                <q-step :name="1" title="选择销售单" icon="local_printshop" done-color="pink-6" :done="step >= 1"> </q-step>
                <q-step :name="2" title="编辑收到的货款" icon="text_increase" :done="step > 2" done-color="teal"> </q-step>
                <q-step :name="3" title="成功！" icon="forward_to_inbox" :done="step > 3" done-color="pink-6"> </q-step>
            </q-stepper>

            <q-card-actions>
                <q-btn v-if="step > 1 && step !== 3" class="q-ml-auto" @click="step = step - 1 < 1 ? 1 : step - 1">上一步</q-btn>
                <q-btn v-if="step !== 3" class="q-ml-auto" color="teal" @click="step = step + 1 > 3 ? 3 : step + 1">下一步</q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";

const _dialog = defineProps({ dialog: Boolean });
watch(_dialog, async (value) => {
    if (value.dialog === true) step.value = 1;
});

const step = ref(1);
watch(step, async (value) => {});
</script>
