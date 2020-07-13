import Ember from "ember";
import _ from "lodash";
import AsyncMixin from "stock/mixins/async";
import { ERROR_STRATEGIES } from "../../mixins/async";

export default Ember.Controller.extend(AsyncMixin, {
  // ----------------------
  // Dependencies
  // ----------------------

  locationService: Ember.inject.service(),
  store: Ember.inject.service(),
  i18n: Ember.inject.service(),

  // ----------------------
  // Properties
  // ----------------------

  tabs: {
    open: "openTab",
    closed: "closedTab",
    cancelled: "cancelledTab"
  },

  stocktakes: Ember.computed(function() {
    return this.get("store").peekAll("stocktake");
  }),

  closedStocktakes: Ember.computed.filterBy("stocktakes", "state", "closed"),
  cancelledStocktakes: Ember.computed.filterBy(
    "stocktakes",
    "state",
    "cancelled"
  ),
  openStocktakes: Ember.computed.filterBy("stocktakes", "state", "open"),

  filteredStocktakes: Ember.computed(
    "selectedTab",
    "stocktakes.[]",
    "stocktakes.@each.state",
    function() {
      const tabs = this.get("tabs");

      const sorted = list => list.sortBy("id").reverse();

      const key = {
        [tabs.open]: "openStocktakes",
        [tabs.closed]: "closedStocktakes",
        [tabs.cancelled]: "cancelledStocktakes"
      }[this.get("selectedTab")];

      return sorted(this.getWithDefault(key, []));
    }
  ),

  showStocktakeList: Ember.computed.not("createMode"),
  showCreateForm: Ember.computed.alias("createMode"),

  stocktakeNameAlreadyExists: Ember.computed(
    "stocktakes.[]",
    "stocktakes.@each.name",
    "newStocktakeName",
    function() {
      const name = this.get("newStocktakeName");
      return !!this.get("stocktakes").findBy("name", name);
    }
  ),

  stocktakeAtLocationAlreadyExists: Ember.computed(
    "selectedLocation",
    "stocktakes.[]",
    "stocktakes.@each.location",
    function() {
      return !!this.get("stocktakes").findBy(
        "location",
        this.get("selectedLocation")
      );
    }
  ),

  missingStocktakeName: Ember.computed.empty("newStocktakeName"),
  invalidStocktakeName: Ember.computed.or(
    "stocktakeNameAlreadyExists",
    "missingStocktakeName"
  ),
  invalidLocation: Ember.computed.empty("selectedLocation"),

  // ----------------------
  // Lifecycle
  // ----------------------

  on() {
    this.resetState();
  },

  off() {
    this.resetState();
  },

  // ----------------------
  // Helpers
  // ----------------------

  generateStocktakeName(location) {
    if (!location) return "";

    return `Stocktake - ${location.get("displayName")} - ${moment().format(
      "MMMM YYYY"
    )}`;
  },

  async resetState() {
    this.set("selectedTab", this.get("tabs.open"));
    this.set("selectedLocation", null);
    this.set("newStocktakeName", "");
    this.set("newStocktakeComment", "");
    this.set("createMode", false);
  },

  async pickLocation() {
    const headerText = this.get("i18n").t("stocktakes.select_location");
    const location = await this.get("locationService").userPickLocation({
      headerText
    });

    this.set("selectedLocation", location);
    this.set("newStocktakeName", this.generateStocktakeName(location));

    return location;
  },

  // ----------------------
  // Actions
  // ----------------------

  actions: {
    pickLocation() {
      return this.pickLocation();
    },

    async cancelCreate() {
      this.set("selectedLocation", null);
      this.set("createMode", false);
    },

    async confirmNewStocktake() {
      this.runTask(async () => {
        await this.get("store")
          .createRecord("stocktake", {
            name: this.get("newStocktakeName"),
            location: this.get("selectedLocation"),
            comment: this.get("newStocktakeComment"),
            state: "open"
          })
          .save();

        this.resetState();
      }, ERROR_STRATEGIES.MODAL);
    },

    async initNewStocktake() {
      const location = await this.pickLocation();

      if (!location) return;

      this.set("createMode", true);
      this.set("newStocktakeComment", "");
    }
  }
});
