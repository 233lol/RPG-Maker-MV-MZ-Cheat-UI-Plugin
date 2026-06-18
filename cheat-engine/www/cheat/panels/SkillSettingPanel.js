export default {
  name: "SkillSettingPanel",

  template: `
<v-card flat class="ma-0 pa-0">
    <v-tabs
        v-model="selectedTab"
        dark
        background-color="grey darken-3"
        show-arrows>
        <v-tab
            v-for="actor in actors"
            :key="actor.id">
            {{actor.name}}
        </v-tab>
    </v-tabs>
    <v-tabs-items
        dark
        v-model="selectedTab">
        <v-tab-item
            v-for="actor in actors"
            :key="actor.id">
            <v-card
                flat
                class="ma-0">
                <v-card-actions
                    class="pa-0">
                    <v-checkbox
                        v-model="actor.onlyLearned"
                        dense
                        hide-details
                        label="只显示已学习技能"
                        @change="onFilterChange">
                    </v-checkbox>
                    <v-spacer></v-spacer>
                    <v-tooltip
                        bottom>
                        <span>重新加载游戏数据</span>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                color="pink"
                                dark
                                small
                                fab
                                v-bind="attrs"
                                v-on="on"
                                @click="initializeVariables">
                                <v-icon>mdi-refresh</v-icon>
                            </v-btn>
                        </template>
                    </v-tooltip>
                </v-card-actions>

                <v-text-field
                    label="搜索技能..."
                    solo
                    background-color="grey darken-3"
                    v-model="actor.skillSearch"
                    dense
                    hide-details
                    @keydown.self.stop
                    @focus="$event.target.select()">
                </v-text-field>

                <v-data-table
                    dense
                    :headers="skillHeaders"
                    :items="getFilteredSkills(actor)"
                    :items-per-page="8"
                    no-data-text="没有匹配的技能"
                    class="mt-2">
                    <template
                        v-slot:item.isLearned="{ item }">
                        <v-icon
                            small
                            :color="item.isLearned ? 'green' : 'grey darken-2'">
                            {{item.isLearned ? 'mdi-check-circle' : 'mdi-circle-outline'}}
                        </v-icon>
                    </template>
                    <template
                        v-slot:item.actions="{ item }">
                        <v-btn
                            v-if="item.isLearned"
                            small
                            color="error"
                            dark
                            @click="removeSkill(actor, item)"
                            class="ma-0">
                            <v-icon small>mdi-close</v-icon>
                            <span class="ml-1">移除</span>
                        </v-btn>
                        <v-btn
                            v-else
                            small
                            color="success"
                            dark
                            @click="addSkill(actor, item)"
                            class="ma-0">
                            <v-icon small>mdi-plus</v-icon>
                            <span class="ml-1">添加</span>
                        </v-btn>
                    </template>
                </v-data-table>
            </v-card>
        </v-tab-item>
    </v-tabs-items>
</v-card>
    `,

  data() {
    return {
      selectedTab: null,
      actors: [],
      allSkills: [],
      skillHeaders: [
        {
          text: "已学",
          value: "isLearned",
          sortable: false,
          align: "center",
          width: "40px",
        },
        {
          text: "名称",
          value: "name",
          sortable: true,
        },
        {
          text: "描述",
          value: "description",
          sortable: false,
        },
        {
          text: "操作",
          value: "actions",
          sortable: false,
          align: "center",
        },
      ],
    };
  },

  created() {
    this.initializeVariables();
  },

  methods: {
    extractSkillData(skill) {
      return {
        _skill: skill,
        id: skill.id,
        name: skill.name,
        description: skill.description,
        iconIndex: skill.iconIndex,
      };
    },

    extractActorData(actor) {
      const learnedSkillIds = actor.skills().map((s) => s.id);

      return {
        _actor: actor,
        id: actor._actorId,
        name: actor._name,
        level: actor.level,
        onlyLearned: false,
        skillSearch: "",
        learnedSkillIds: learnedSkillIds,
      };
    },

    initializeVariables() {
      // Load all skills from game data
      this.allSkills = ($dataSkills || [])
        .filter((skill) => !!skill && skill.name)
        .map((skill) => this.extractSkillData(skill));

      // Load actors
      this.actors = $gameParty
        .members()
        .map((actor) => this.extractActorData(actor));
    },

    getFilteredSkills(actor) {
      const search = (actor.skillSearch || "").toLowerCase().trim();

      return this.allSkills
        .map((skill) => {
          const isLearned = actor.learnedSkillIds.includes(skill.id);
          return {
            ...skill,
            isLearned: isLearned,
          };
        })
        .filter((skill) => {
          // Only learned filter
          if (actor.onlyLearned && !skill.isLearned) {
            return false;
          }
          // Search filter
          if (
            search &&
            !skill.name.toLowerCase().includes(search) &&
            !skill.description.toLowerCase().includes(search)
          ) {
            return false;
          }
          return true;
        });
    },

    onFilterChange() {
      // no-op, reactivity handles it
    },

    addSkill(actor, skillItem) {
      const actorObj = actor._actor;
      const skill = skillItem._skill;

      // Check if actor already knows this skill
      if (actorObj.isLearnedSkill(skill.id)) {
        return;
      }

      // Learn the skill
      actorObj.learnSkill(skill.id);

      // Refresh the actor's learned skill ids
      actor.learnedSkillIds = actorObj.skills().map((s) => s.id);
    },

    removeSkill(actor, skillItem) {
      const actorObj = actor._actor;
      const skill = skillItem._skill;

      // Forget the skill
      actorObj.forgetSkill(skill.id);

      // Refresh the actor's learned skill ids
      actor.learnedSkillIds = actorObj.skills().map((s) => s.id);
    },
  },
};