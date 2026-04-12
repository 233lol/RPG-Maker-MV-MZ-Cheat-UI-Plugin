import { ConfirmDialog } from "../js/DialogHelper.js";
import { KeyValueStorage } from "../js/KeyValueStorage.js";

export default {
  name: "SwitchSettingPanel",

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
            <div class="d-flex px-3 pt-3 pb-3">
                <v-checkbox
                    v-model="excludeNameless"
                    dense
                    hide-details
                    label="隐藏无名开关">
                </v-checkbox>
                <v-spacer></v-spacer>
                <v-tooltip
                    bottom>
                    <span>{{ allSwitchOn ? '关闭所有过滤的开关' : '打开所有过滤的开关' }}</span>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn
                            color="teal"
                            v-bind="attrs"
                            v-on="on"
                            fab
                            x-small
                            @click="toggleAllSwitches">
                            <v-icon v-text="allSwitchIcon"></v-icon>
                        </v-btn>
                    </template>
                </v-tooltip>
                      <v-tooltip bottom>
                        <span>{{ allFilteredLocked ? '解锁所有过滤项' : '锁定所有过滤项' }}</span>
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            color="amber"
                            class="ml-2"
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
            <v-switch
                v-model="item.value"
                dense
                hide-details
                @click.self.stop
                @change="onItemChange(item)">
            </v-switch>
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

      switchNames: [],

      tableHeaders: [
        {
          text: "开关名",
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
      "./www/cheat-settings/switch-locks.json",
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
        if (
          item.id === 0 ||
          (this.excludeNameless && !item.name) ||
          !this.tableItemFilter(item.name, this.search, item)
        ) {
          return false;
        }

        return true;
      });
    },

    allSwitchOn() {
      const hasTurnOff = this.filteredTableItems.find(
        (item) => item.value === false,
      );
      return !!!hasTurnOff;
    },

    allSwitchIcon() {
      return this.allSwitchOn ? "mdi-toggle-switch-off" : "mdi-toggle-switch";
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
      this.switchNames = await this.getSwitchNames();

      this.tableItems = this.switchNames.map((switchName, idx) => {
        const savedLock = previousLockMap.get(idx);
        return {
          id: idx,
          name: switchName,
          value: $gameSwitches.value(idx),
          lockEnabled: savedLock ? savedLock.lockEnabled : false,
          lockValue:
            savedLock && typeof savedLock.lockValue === "boolean"
              ? savedLock.lockValue
              : $gameSwitches.value(idx),
        };
      });
    },

    async getSwitchNames() {
      return $dataSystem.switches.slice();
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
          lockValue: !!item.lockValue,
        };
      });

      this.persistedLockMap = payload;
      this.lockStorage.setItem("data", JSON.stringify(payload));
    },

    onItemChange(item) {
      // modify value
      $gameSwitches.setValue(item.id, item.value);

      // refresh
      item.value = $gameSwitches.value(item.id);
      if (item.lockEnabled) {
        item.lockValue = item.value;
        this.writePersistedLocks();
      }
    },

    toggleItemLock(item) {
      item.lockEnabled = !item.lockEnabled;
      if (item.lockEnabled) {
        item.lockValue = !!$gameSwitches.value(item.id);
        this.applySwitchLock(item);
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
          item.lockValue = !!$gameSwitches.value(item.id);
          this.applySwitchLock(item);
        }
      });

      this.writePersistedLocks();
    },

    applySwitchLock(item) {
      if (!item || !item.lockEnabled) {
        return;
      }

      const currentValue = !!$gameSwitches.value(item.id);
      const lockValue = !!item.lockValue;
      if (currentValue !== lockValue) {
        $gameSwitches.setValue(item.id, lockValue);
      }
      item.value = !!$gameSwitches.value(item.id);
    },

    applyAllSwitchLocks() {
      this.tableItems.forEach((item) => {
        if (item.id > 0 && item.lockEnabled) {
          this.applySwitchLock(item);
        }
      });
    },

    startLockUpdater() {
      if (this.lockUpdateTimer) {
        return;
      }

      this.lockUpdateTimer = window.setInterval(() => {
        this.applyAllSwitchLocks();
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
            lockValue: !!item.lockValue,
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
          lockValue: !!lockItem.lockValue,
        });
      });

      return map;
    },

    tableItemFilter(value, search, item) {
      if (search === null || search.trim() === "") {
        return true;
      }

      return String(item.name || "")
        .toLowerCase()
        .includes(search.toLowerCase());
    },

    toggleAllSwitches() {
      const self = this;
      ConfirmDialog.show({
        width: 450,
        message:
          (this.allSwitchOn
            ? "Turn off all filtered switches?"
            : "Turn on all filtered switches?") +
          "\n(CAUTION: Potential to give fatal errors to save data)",
        actions: [
          {
            icon: "mdi-close",
            label: "cancel",
            color: "white",
            action: ConfirmDialog.close,
          },
          {
            icon: this.allSwitchIcon,
            color: "green",
            label: this.allSwitchOn ? "Turn Off" : "Turn On",
            async action() {
              const value = !self.allSwitchOn;
              self.filteredTableItems.forEach((item) => {
                $gameSwitches.setValue(item.id, value);
                item.value = value;
                if (item.lockEnabled) {
                  item.lockValue = value;
                }
              });
              self.writePersistedLocks();
              self.initializeVariables();
              ConfirmDialog.close();
            },
          },
        ],
      });
    },
  },
};
