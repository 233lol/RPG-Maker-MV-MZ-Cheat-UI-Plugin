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

                <v-card-subtitle class="pa-0 mt-2">已学习技能</v-card-subtitle>
                <v-data-table
                    dense
                    :headers="learnedSkillHeaders"
                    :items="actor.learnedSkills"
                    :items-per-page="3"
                    no-data-text="尚未学习任何技能">
                    <template
                        v-slot:item.actions="{ item }">
                        <v-btn
                            small
                            color="error"
                            dark
                            @click="removeSkill(actor, item)"
                            class="ma-0">
                            <v-icon small>mdi-close</v-icon>
                            <span class="ml-1">移除</span>
                        </v-btn>
                    </template>
                </v-data-table>

                <v-divider class="my-4"></v-divider>

                <v-card-subtitle class="pa-0 mt-2">可学习技能</v-card-subtitle>
                <v-text-field
                    label="搜索技能..."
                    solo
                    background-color="grey darken-3"
                    v-model="skillSearch"
                    dense
                    hide-details
                    @keydown.self.stop
                    @focus="$event.target.select()">
                </v-text-field>
                <v-data-table
                    dense
                    :headers="allSkillsHeaders"
                    :items="filteredAllSkills"
                    :items-per-page="5"
                    no-data-text="没有可用技能">
                    <template
                        v-slot:item.actions="{ item }">
                        <v-btn
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
      skillSearch: "",
      learnedSkillHeaders: [
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
      allSkillsHeaders: [
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

  computed: {
    filteredAllSkills() {
      const search = this.skillSearch.toLowerCase().trim();
      return this.allSkills.filter((skill) => {
        // Skip nameless skills
        if (!skill.name) {
          return false;
        }
        // Apply search filter
        if (search && !skill.name.toLowerCase().includes(search) && !skill.description.toLowerCase().includes(search)) {
          return false;
        }
        return true;
      });
    },
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
      const learnedSkills = actor.skills().map((skill) => this.extractSkillData(skill));
      const currentExp = actor.currentExp();

      return {
        _actor: actor,
        id: actor._actorId,
        name: actor._name,
        level: actor.level,
        exp: currentExp,
        learnedSkills: learnedSkills,
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

    addSkill(actor, skillItem) {
      const actorObj = actor._actor;
      const skill = skillItem._skill;

      // Check if actor already knows this skill
      if (actorObj.isLearnedSkill(skill.id)) {
        return;
      }

      // Learn the skill
      actorObj.learnSkill(skill.id);

      // Refresh the actor's learned skills list
      actor.learnedSkills = actorObj.skills().map((s) => this.extractSkillData(s));
    },

    removeSkill(actor, skillItem) {
      const actorObj = actor._actor;
      const skill = skillItem._skill;

      // Forget the skill
      actorObj.forgetSkill(skill.id);

      // Refresh the actor's learned skills list
      actor.learnedSkills = actorObj.skills().map((s) => this.extractSkillData(s));
    },
  },
};