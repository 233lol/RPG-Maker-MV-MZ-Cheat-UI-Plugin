export default {
  name: "PageJump",

  template: `
<span>
  <v-text-field
    v-model="inputVal"
    type="number"
    :min="1"
    :max="pageCount"
    dense
    hide-details
    class="page-jump-input d-inline-flex"
    style="width: 52px;"
    @keydown.self.stop
    @keydown.enter="jump"
    @focus="$event.target.select()">
  </v-text-field>
  <v-btn
    x-small
    icon
    @click="jump">
    <v-icon x-small>mdi-arrow-right-bold</v-icon>
  </v-btn>
</span>
  `,

  props: {
    page: { type: Number, required: true },
    pageCount: { type: Number, required: true },
  },

  data() {
    return {
      inputVal: this.page,
    };
  },

  watch: {
    page(val) {
      this.inputVal = val;
    },
  },

  methods: {
    jump() {
      const p = Number(this.inputVal);
      if (p >= 1 && p <= this.pageCount) {
        this.$emit("jump", p);
      }
      this.inputVal = this.page;
    },
  },
};
