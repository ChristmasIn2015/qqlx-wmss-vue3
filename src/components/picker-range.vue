<template>
    <q-btn square color="white" text-color="black" class="q-ml-sm">
        {{ string_start_time }} ~ {{ string_end_time }}
        <q-menu>
            <div class="row bg-grey-11">
                <q-list class="q-pt-sm">
                    <q-item clickable @click="() => $emit('change', getRangeDay())">
                        <q-item-section>今日</q-item-section>
                    </q-item>
                    <q-item clickable @click="() => $emit('change', getRangeWeek())">
                        <q-item-section>本周</q-item-section>
                    </q-item>
                    <q-item clickable @click="() => $emit('change', getRangeMonth())">
                        <q-item-section>本月</q-item-section>
                    </q-item>
                    <q-item clickable @click="() => $emit('change', getRangeYear())">
                        <q-item-section>本年</q-item-section>
                    </q-item>
                </q-list>

                <q-date range minimal no-unset color="primary" first-day-of-week="1" v-model="time_range" />
            </div>
        </q-menu>
    </q-btn>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { getRangeDay, getRangeWeek, getRangeMonth, getRangeYear, getTime } from "qqlx-cdk";

const vue_props = defineProps({
    startTime: {
        type: Number,
        default: getRangeYear().startTime,
    },
    endTime: {
        type: Number,
        default: getRangeYear().endTime,
    },
});
const string_start_time = computed(() => getTime(vue_props.startTime).text);
const string_end_time = computed(() => getTime(vue_props.endTime).text);

const emit = defineEmits(["change"]);
const time_range = computed({
    get() {
        return { from: string_start_time.value, to: string_end_time.value };
    },
    set(value) {
        if (typeof value === "string") {
            emit("change", {
                startTime: new Date(value + " 00:00:00").getTime(),
                endTime: new Date(value + " 23:59:59").getTime(),
            });
        } else if (value) {
            emit("change", {
                startTime: new Date(value.from + " 00:00:00").getTime(),
                endTime: new Date(value.to + " 23:59:59").getTime(),
            });
        }
    },
});
</script>
