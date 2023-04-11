<template>
    <q-btn square push color="white" text-color="black" class="q-ml-sm">
        {{ time_range?.from }} ~ {{ time_range?.to }}
        <q-menu>
            <div class="row bg-grey-11">
                <q-list class="q-pt-sm">
                    <q-item
                        clickable
                        @click="
                            () => {
                                setRange(getRangeDay());
                                $emit('change', {
                                    startTime: new Date(time_range.from + ' 00:00:00').getTime(),
                                    endTime: new Date(time_range.to + ' 23:59:59').getTime(),
                                });
                            }
                        "
                    >
                        <q-item-section>今日</q-item-section>
                    </q-item>
                    <q-item
                        clickable
                        @click="
                            () => {
                                setRange(getRangeWeek());
                                $emit('change', {
                                    startTime: new Date(time_range.from + ' 00:00:00').getTime(),
                                    endTime: new Date(time_range.to + ' 23:59:59').getTime(),
                                });
                            }
                        "
                    >
                        <q-item-section>本周</q-item-section>
                    </q-item>
                    <q-item
                        clickable
                        @click="
                            () => {
                                setRange(getRangeMonth());
                                $emit('change', {
                                    startTime: new Date(time_range.from + ' 00:00:00').getTime(),
                                    endTime: new Date(time_range.to + ' 23:59:59').getTime(),
                                });
                            }
                        "
                    >
                        <q-item-section>本月</q-item-section>
                    </q-item>
                    <q-item
                        clickable
                        @click="
                            () => {
                                setRange(getRangeYear());
                                $emit('change', {
                                    startTime: new Date(time_range.from + ' 00:00:00').getTime(),
                                    endTime: new Date(time_range.to + ' 23:59:59').getTime(),
                                });
                            }
                        "
                    >
                        <q-item-section>本年</q-item-section>
                    </q-item>
                </q-list>

                <q-date
                    range
                    minimal
                    color="primary"
                    first-day-of-week="1"
                    v-model="time_range"
                    @update:model-value="
                        ($event) => {
                            if (typeof $event === 'string') {
                                time_range = { from: $event, to: $event };
                                $emit('change', {
                                    startTime: new Date($event + ' 00:00:00').getTime(),
                                    endTime: new Date($event + ' 23:59:59').getTime(),
                                });
                            } else if (time_range) {
                                $emit('change', {
                                    startTime: new Date(time_range.from + ' 00:00:00').getTime(),
                                    endTime: new Date(time_range.to + ' 23:59:59').getTime(),
                                });
                            }
                        }
                    "
                />
            </div>
        </q-menu>
    </q-btn>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { getRangeDay, getRangeWeek, getRangeMonth, getRangeYear } from "qqlx-cdk";

const time_range = ref({
    from: `${new Date().getFullYear()}/01/01`,
    to: new Date().toLocaleString().split(" ")[0],
});

const setRange = (range: { startTime: number; endTime: number }) => {
    const from = new Date(range.startTime);
    const from_month = from.getMonth() + 1 < 10 ? `0${from.getMonth() + 1}` : from.getMonth() + 1;
    const from_day = from.getDate() < 10 ? `0${from.getDate()}` : from.getDate();

    const to = new Date(range.endTime);
    const to_month = to.getMonth() + 1 < 10 ? `0${to.getMonth() + 1}` : to.getMonth() + 1;
    const to_day = to.getDate() < 10 ? `0${to.getDate()}` : to.getDate();

    time_range.value = {
        from: `${from.getFullYear()}/${from_month}/${from_day}`,
        to: `${to.getFullYear()}/${to_month}/${to_day}`,
    };
};
</script>
