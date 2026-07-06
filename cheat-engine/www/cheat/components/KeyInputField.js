import { Key } from "../js/KeyCodes.js";

export default {
  name: "KeyInputField",

  template: `
<v-text-field
    :model-value="showingText"
    :label="label"
    :variant="variant"
    :bg-color="backgroundColor"
    density="compact"
    hide-details
    @keydown.stop.prevent="onShortcutInput"
    @focus="$event.target.select()">
    <template #append>
        <v-btn 
            v-if="deletable"
            :disabled="modelValue.isEmpty()"
            size="small"
            :style="deleteBtnStyle"
            icon
            @click="onDeleteClick">
            <v-icon size="small">mdi-close-circle</v-icon>
        </v-btn>
    </template>
</v-text-field>
    `,

  emits: ["update:modelValue", "change"],

  data() {
    return {};
  },

  props: {
    modelValue: {
      type: Key,
      default: () => Key.createEmpty(),
    },

    deletable: {
      type: Boolean,
      default: true,
    },

    label: {
      type: String,
      default: "",
    },

    solo: {
      type: Boolean,
      default: false,
    },

    outlined: {
      type: Boolean,
      default: false,
    },

    backgroundColor: {
      type: String,
      default: undefined,
    },

    combiningKeyAlone: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    variant() {
      if (this.outlined) return "outlined";
      if (this.solo) return "solo";
      return undefined;
    },

    deleteBtnStyle() {
      return `opacity: ${this.modelValue.isEmpty() ? 0 : 0.7}`;
    },

    showingText() {
      return this.modelValue.asDisplayString();
    },
  },

  methods: {
    onDeleteClick() {
      const eventKey = Key.createEmpty();
      this.$emit("update:modelValue", eventKey);
      this.$emit("change", eventKey);
    },

    onShortcutInput(e) {
      const eventKey = Key.fromEvent(e);

      if (eventKey.isCombiningKey() && !this.combiningKeyAlone) {
        return;
      }

      if (!eventKey.equals(this.modelValue)) {
        this.$emit("update:modelValue", eventKey);
        this.$emit("change", eventKey);
      }
    },
  },
};
