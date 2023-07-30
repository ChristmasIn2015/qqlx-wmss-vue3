<template>
    <q-btn square color="white" text-color="primary">
        {{ vue_props.title }} {{ time_input }}
        <q-menu v-model="show">
            <q-date minimal color="primary" first-day-of-week="1" v-model="time_input" />
        </q-menu>
    </q-btn>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { getRangeDay, getRangeWeek, getRangeMonth, getRangeYear, getTime } from "qqlx-cdk";

const show = ref(false);
const vue_props = defineProps({
    title: {
        type: String,
        default: ":",
    },
    time: {
        type: Number,
        default: getRangeYear().startTime,
    },
});
const emit = defineEmits(["change"]);
const time_input = computed({
    get: () => getTime(vue_props.time).text,
    set: (value) => {
        emit("change", new Date(value).getTime());
        show.value = false;
    },
});
</script>
