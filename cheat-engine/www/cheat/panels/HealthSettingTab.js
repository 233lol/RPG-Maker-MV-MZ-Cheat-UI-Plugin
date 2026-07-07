export default {
  name: "HealthSettingTab",

  template: `
<div>
    <v-data-table
        v-if="tableHeaders"
        density="compact"
        :headers="tableHeaders"
        :items="editingItems"
        hide-default-footer>
        <template #item.name="{ item }">
            <span class="text-caption">{{item.name}}</span>
        </template>
        <template #item.hp="{ item }">
            <div class="d-flex align-center" style="gap: 2px; white-space: nowrap;">
                <v-text-field
                    bg-color="grey-darken-3"
                    class="inline-field"
                    style="width: 70px; flex: none;"
                    hide-details
                    variant="solo"
                    v-model="item.hp.hp"
                    density="compact"
                    @change.stop="onDataChange"
                    @focus="$event.target.select()"
                    @keydown.stop>
                </v-text-field>
                <span class="text-caption" style="flex: none;">/ {{item.hp.mhp}}</span>
            </div>
        </template>
        <template #item.mp="{ item }">
            <div class="d-flex align-center" style="gap: 2px; white-space: nowrap;">
                <v-text-field
                    bg-color="grey-darken-3"
                    class="inline-field"
                    style="width: 70px; flex: none;"
                    hide-details
                    variant="solo"
                    v-model="item.mp.mp"
                    density="compact"
                    @change.stop="onDataChange"
                    @focus="$event.target.select()"
                    @keydown.stop>
                </v-text-field>
                <span class="text-caption" style="flex: none;">/ {{item.mp.mmp}}</span>
            </div>
        </template>
    </v-data-table>
</div>
    `,

  data() {
    return {
      tableHeaders: [
        {
          title: "名字",
          key: "name",
        },
        {
          title: "HP",
          key: "hp",
        },
        {
          title: "MP",
          key: "mp",
        },
      ],

      editingItems: [],
    };
  },

  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },

  watch: {
    items: {
      immediate: true,
      handler() {
        this.editingItems = this.items.map((member) => {
          return {
            _member: member,
            name: member.name(),
            hp: {
              hp: Number(member.hp),
              mhp: Number(member.mhp),
            },
            mp: {
              mp: Number(member.mp),
              mmp: Number(member.mmp),
            },
          };
        });
      },
    },
  },

  methods: {
    onDataChange() {
      if (!Array.isArray(this.editingItems)) return;
      this.$emit("change", this.editingItems);
    },
  },
};
