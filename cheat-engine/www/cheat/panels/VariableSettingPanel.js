import { KeyValueStorage } from "../js/KeyValueStorage.js";

export default {
  name: "VariableSettingPanel",

  template: `
<v-card flat class="ma-0 pa-0">
    <v-data-table
        v-if="tableHeaders"
        denses
        :headers="tableHeaders"
        :items="filteredTableItems"
        :search="search"
        :custom-filter="tableItemFilter"
        :items-per-page="5">
        <template v-slot:top>
            <v-text-field
                label="搜索..."
                solo
                background-color="grey darken-3"
                v-model="search"
                dense
                hide-details
                @keydown.self.stop
                @focus="$event.target.select()">
            </v-text-field>
            <div class="d-flex align-center px-3 pt-3 pb-3">
                <v-checkbox
                    v-model="excludeNameless"
                    dense
                    hide-details
                    label="隐藏无名变量">
                </v-checkbox>
                <v-spacer></v-spacer>
                <v-tooltip bottom>
                    <span>{{ allFilteredLocked ? '解锁所有过滤项' : '锁定所有过滤项' }}</span>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            color="amber"
                            v-bind="attrs"
                            v-on="on"
                            fab
                            x-small
                            @click="toggleAllFilteredLocks">
                            <v-icon>{{ allFilteredLocked ? 'mdi-lock-open-variant' : 'mdi-lock' }}</v-icon>
                        </v-btn>
                    </template>
                </v-tooltip>
            </div>
        </template>
        <template
            v-slot:item.value="{ item }">
            <v-text-field
                background-color="grey darken-3"
                class="d-inline-flex"
                height="10"
                style="width: 60px;"
                hide-details
                solo
                v-model="item.value"
                label="Value"
                dense
                @keydown.self.stop
                @change="onItemChange(item)"
                @focus="$event.target.select()">
            </v-text-field>
        </template>
        <template v-slot:item.lock="{ item }">
            <v-btn
                icon
                x-small
                :color="item.lockEnabled ? 'amber' : 'grey lighten-1'"
                @click.stop="toggleItemLock(item)">
                <v-icon>{{ item.lockEnabled ? 'mdi-lock' : 'mdi-lock-open-variant' }}</v-icon>
            </v-btn>
        </template>
    </v-data-table>
    
    <v-tooltip
        bottom>
        <span>重新加载游戏数据</span>
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                style="top: 0px; right: 0px;"
                color="pink"
                dark
                small
                absolute
                top
                right
                fab
                v-bind="attrs"
                v-on="on"
                @click="initializeVariables">
                <v-icon>mdi-refresh</v-icon>
            </v-btn>
        </template>
    </v-tooltip>
</v-card>
    `,

  data() {
    return {
      search: "",
      excludeNameless: true,

      variableNames: [],

      tableHeaders: [
        {
          text: "变量名",
          value: "name",
        },
        {
          text: "值",
          value: "value",
        },
        {
          text: "锁定",
          value: "lock",
          sortable: false,
          width: 72,
        },
      ],
      tableItems: [],
      lockUpdateTimer: null,
      lockUpdateIntervalMs: 2500,
      lockStorage: null,
      persistedLockMap: {},
    };
  },

  created() {
    this.lockStorage = new KeyValueStorage(
      "./www/cheat-settings/variable-locks.json",
    );
    this.readPersistedLocks();
    this.initializeVariables();
    this.startLockUpdater();
  },

  beforeDestroy() {
    this.stopLockUpdater();
  },

  computed: {
    filteredTableItems() {
      return this.tableItems.filter((item) => {
        if (this.excludeNameless && !item.name) {
          return false;
        }

        return true;
      });
    },

    allFilteredLocked() {
      const lockableItems = this.filteredTableItems.filter(
        (item) => item.id > 0,
      );
      if (lockableItems.length === 0) {
        return false;
      }

      return lockableItems.every((item) => !!item.lockEnabled);
    },
  },

  methods: {
    async initializeVariables() {
      const previousLockMap = this.getLockMapById();
      this.variableNames = await this.getVariableNames();

      this.tableItems = this.variableNames.map((varName, idx) => {
        const savedLock = previousLockMap.get(idx);
        return {
          id: idx,
          name: varName,
          value: $gameVariables.value(idx),
          lockEnabled: savedLock ? savedLock.lockEnabled : false,
          lockValue: savedLock
            ? savedLock.lockValue
            : $gameVariables.value(idx),
        };
      });
    },

    async getVariableNames() {
      return $dataSystem.variables.slice();
    },

    readPersistedLocks() {
      try {
        const raw = this.lockStorage.getItem("data");
        if (!raw) {
          this.persistedLockMap = {};
          return;
        }

        const data = JSON.parse(raw);
        this.persistedLockMap = data && typeof data === "object" ? data : {};
      } catch (error) {
        this.persistedLockMap = {};
      }
    },

    writePersistedLocks() {
      const payload = {};
      this.tableItems.forEach((item) => {
        if (!item.lockEnabled || item.id <= 0) {
          return;
        }

        payload[item.id] = {
          lockEnabled: true,
          lockValue: item.lockValue,
        };
      });

      this.persistedLockMap = payload;
      this.lockStorage.setItem("data", JSON.stringify(payload));
    },

    onItemChange(item) {
      const v = $gameVariables.value(item.id);
      typeof v === "number"
        ? $gameVariables.setValue(item.id, Number(item.value))
        : $gameVariables.setValue(item.id, item.value);

      item.value = $gameVariables.value(item.id);
      if (item.lockEnabled) {
        item.lockValue = item.value;
        this.writePersistedLocks();
      }
    },

    toggleItemLock(item) {
      item.lockEnabled = !item.lockEnabled;
      if (item.lockEnabled) {
        item.lockValue = $gameVariables.value(item.id);
        this.applyVariableLock(item);
      }

      this.writePersistedLocks();
    },

    toggleAllFilteredLocks() {
      const targetLockEnabled = !this.allFilteredLocked;

      this.filteredTableItems.forEach((item) => {
        if (item.id <= 0) {
          return;
        }

        item.lockEnabled = targetLockEnabled;
        if (targetLockEnabled) {
          item.lockValue = $gameVariables.value(item.id);
          this.applyVariableLock(item);
        }
      });

      this.writePersistedLocks();
    },

    applyVariableLock(item) {
      if (!item || !item.lockEnabled) {
        return;
      }

      const currentValue = $gameVariables.value(item.id);
      const lockValue = item.lockValue;
      if (currentValue !== lockValue) {
        $gameVariables.setValue(item.id, lockValue);
      }
      item.value = $gameVariables.value(item.id);
    },

    applyAllVariableLocks() {
      this.tableItems.forEach((item) => {
        if (item.id > 0 && item.lockEnabled) {
          this.applyVariableLock(item);
        }
      });
    },

    startLockUpdater() {
      if (this.lockUpdateTimer) {
        return;
      }

      this.lockUpdateTimer = window.setInterval(() => {
        this.applyAllVariableLocks();
      }, this.lockUpdateIntervalMs);
    },

    stopLockUpdater() {
      if (!this.lockUpdateTimer) {
        return;
      }

      window.clearInterval(this.lockUpdateTimer);
      this.lockUpdateTimer = null;
    },

    getLockMapById() {
      const map = new Map();

      if (this.tableItems.length > 0) {
        this.tableItems.forEach((item) => {
          map.set(item.id, {
            lockEnabled: !!item.lockEnabled,
            lockValue: item.lockValue,
          });
        });
        return map;
      }

      Object.keys(this.persistedLockMap || {}).forEach((idText) => {
        const id = Number(idText);
        if (!Number.isInteger(id)) {
          return;
        }

        const lockItem = this.persistedLockMap[idText] || {};
        map.set(id, {
          lockEnabled: !!lockItem.lockEnabled,
          lockValue: lockItem.lockValue,
        });
      });

      return map;
    },

    tableItemFilter(value, search, item) {
      if (search === null || search.trim() === "") {
        return true;
      }

      search = search.toLowerCase();
      const itemName = String(item.name || "").toLowerCase();
      const itemValue = String(item.value).toLowerCase();

      return itemName.includes(search) || itemValue.includes(search);
    },
  },
};
