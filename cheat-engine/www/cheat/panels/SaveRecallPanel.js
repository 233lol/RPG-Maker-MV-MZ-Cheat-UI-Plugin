import PageJump from "../components/PageJump.js";
import { KEY_VALUE_STORAGE } from "../js/KeyValueStorage.js";

export default {
  name: "SaveRecallPanel",

  components: { PageJump },

  template: `
<v-card flat class="ma-0 pa-0">
    <v-card-subtitle class="ma-0 pa-0">保存当前位置</v-card-subtitle>
    <span class="text-body-2 text-green-darken-1">地图 : {{currentMapName}}</span>
    <v-text-field
        ref="locationAliasField"
        label="位置别名"
        variant="solo"
        bg-color="grey-darken-3"
        v-model="locationAliasInput"
        density="compact"
        hide-details
        @keydown="onLocationAliasKeyDown"
        @focus="$event.target.select()"
        @keydown.stop>
        <template #append-outer>
            <v-tooltip
                location="bottom">
                <template #activator="{ props }">
                    <v-btn
                        class="mt-n1"
                        color="teal"
                        size="x-small"
                        icon
                        v-bind="props"
                        @click="onAddLocation">
                        <v-icon>mdi-plus</v-icon>
                    </v-btn>
                </template>
                <span>保存当前位置</span>
            </v-tooltip>
        </template>
    </v-text-field>

    <v-card-subtitle class="ma-0 pa-0 mt-5">搜索保存的位置</v-card-subtitle>
    <v-data-table
        v-if="tableHeaders"
        class="mt-2"
        density="compact"
        :headers="tableHeaders"
        :items="tableItems"
        :search="search"
         :custom-filter="tableItemFilter"
         v-model:page="pagination.page"
         v-model:items-per-page="pagination.itemsPerPage"
         :items-per-page-options="[5, 10, 15, { title: 'All', value: -1 }]">
        <template #top>
            <v-text-field
                label="搜索..."
                variant="solo"
                bg-color="grey-darken-3"
                v-model="search"
                density="compact"
                hide-details
                @focus="$event.target.select()"
                @keydown.stop>
            </v-text-field>
        </template>
        <template
            #item.coord="{ item }">
            {{ item.coord.x }}, {{ item.coord.y }}
        </template>
        <template
            #item.actions="{ item, index }">
            
            <v-tooltip
                location="bottom">
                <template #activator="{ props }">
                    <v-btn
                        color="green"
                        size="x-small"
                        icon
                        v-bind="props"
                        @click="teleportLocation(item.mapId, item.coord.x, item.coord.y)">
                        <v-icon size="small">mdi-map-marker</v-icon>
                    </v-btn>
                </template>
                <span>传送</span>
            </v-tooltip>
            
            
            <v-tooltip
                location="bottom">
                <template #activator="{ props }">
                    <v-btn
                        color="red"
                        class="ml-2"
                        size="x-small"
                        icon
                        v-bind="props"
                        @click="removeLocation(index)">
                        <v-icon size="small">mdi-delete</v-icon>
                    </v-btn>
                </template>
                <span>删除</span>
            </v-tooltip>
        </template>
         <template #bottom>
             <div class="d-flex align-center justify-space-between pa-2">
                 <div class="d-flex align-center">
                     <span class="text-caption mr-2">每页</span>
                     <v-select
                         v-model="pagination.itemsPerPage"
                         :items="[5, 10, 15, 20]"
                         density="compact"
                         hide-details
                         variant="outlined"
                         style="width: 90px;"
                     ></v-select>
                 </div>
                 <div class="d-flex align-center ga-2">
                     <span class="text-caption text-no-wrap">{{ paginationStart }}-{{ paginationStop }} / {{ totalCount }}</span>
                     <v-pagination v-model="pagination.page" :length="pageCount" density="compact" :total-visible="5" size="small"></v-pagination>
                     <page-jump
                         :page="pagination.page"
                         :page-count="pageCount"
                         @jump="jumpToPage">
                     </page-jump>
                 </div>
             </div>
         </template>
    </v-data-table>
    <v-tooltip
        location="bottom">
        <template #activator="{ props }">
            <v-btn
                color="pink"
                size="small"
                icon
                style="position: absolute; top: 0px; right: 0px;"
                v-bind="props"
                @click="initializeVariables">
                <v-icon>mdi-refresh</v-icon>
            </v-btn>
        </template>
        <span>重新加载游戏数据</span>
    </v-tooltip>
</v-card>
    `,

  data() {
    return {
      locationAliasInput: "",

      search: "",

      locations: [],

      currentMapName: "",

      tableHeaders: [
        {
          title: "别名",
          key: "name",
        },
        {
          title: "地图名",
          key: "mapName",
        },
        {
          title: "坐标",
          key: "coord",
        },
        {
          title: "操作",
          key: "actions",
        },
      ],
      pagination: { page: 1, itemsPerPage: 5 },
    };
  },

  mounted() {
    this.initializeVariables();
    this.$refs.locationAliasField.focus();
  },

  computed: {
    tableItems() {
      return this.locations.map((location, idx) => {
        return {
          name: location.name,
          mapName: $dataMapInfos[location.mapId]
            ? $dataMapInfos[location.mapId].name
            : "NULL",
          mapId: location.mapId,
          coord: {
            x: location.x,
            y: location.y,
          },
        };
      });
    },

    filteredTableItems() {
      return this.tableItems.filter((item) => {
        if (this.excludeNameless && !item.name) {
          return false;
        }

        return true;
      });
    },

    totalCount() {
      return this.tableItems.length;
    },

    paginationStart() {
      if (this.totalCount === 0) return 0;
      return (this.pagination.page - 1) * this.pagination.itemsPerPage + 1;
    },

    paginationStop() {
      return Math.min(this.pagination.page * this.pagination.itemsPerPage, this.totalCount);
    },

    pageCount() {
      return Math.ceil(this.tableItems.length / this.pagination.itemsPerPage) || 1;
    },
  },

  methods: {
    jumpToPage(page) {
      this.pagination.page = page;
    },

    async initializeVariables() {
      this.loadLocations();
      this.currentMapName = await this.getMapFullPath($gameMap.mapId());
    },

    async getMapFullPath(id) {
      if (!id || !$dataMapInfos[id]) {
        return "NULL";
      }

      let fullPath = [];
      this.getMapAncestors(id, fullPath);

      return fullPath.map((id) => $dataMapInfos[id].name).join(" / ");
    },

    getMapAncestors(id, path) {
      path.push(id);
      if ($dataMapInfos[id].parentId === 0) {
        path.reverse();
        return;
      }

      this.getMapAncestors($dataMapInfos[id].parentId, path);
    },

    saveLocations() {
      KEY_VALUE_STORAGE.setItem(
        "cheat.locations",
        JSON.stringify(this.locations),
      );
    },

    loadLocations() {
      const data = KEY_VALUE_STORAGE.getItem("cheat.locations");

      if (!data) {
        this.locations = [];
        return;
      }

      this.locations = JSON.parse(data);
    },

    onLocationAliasKeyDown(e) {
      if (e.code === "Enter") {
        this.onAddLocation();
      }
    },

    onAddLocation() {
      this.addLocation(this.locationAliasInput);
      this.locationAliasInput = "";
      this.$refs.locationAliasField.blur();
    },

    addLocation(locationAlias) {
      this.locations.push({
        name: locationAlias,
        mapId: $gameMap.mapId(),
        x: $gamePlayer.x,
        y: $gamePlayer.y,
      });
      this.saveLocations();
    },

    removeLocation(index) {
      this.locations.splice(index, 1);
      this.saveLocations();
    },

    teleportLocation(mapId, x, y) {
      $gamePlayer.reserveTransfer(mapId, x, y, $gamePlayer.direction(), 0);
      $gamePlayer.setPosition(x, y);
    },

    tableItemFilter(value, search, item) {
      if (search === null || search.trim() === "") {
        return true;
      }

      search = search.toLowerCase();

      return (
        item.name.toLowerCase().includes(search) ||
        item.mapName.toLowerCase().includes(search) ||
        String(item.value).toLowerCase().includes(search)
      );
    },
  },
};
