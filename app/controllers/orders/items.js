import config from "../../config/environment";
import Ember from "ember";
import _ from "lodash";
import SearchMixin from "stock/mixins/search_resource";

export default Ember.Controller.extend(SearchMixin, {
  // queryParams: ["searchInput"],
  hideDetailsLink: true,
  settings: Ember.inject.service(),

  orderId: Ember.computed.alias("model.id"),
  isMobileApp: config.cordova.enabled,
  autoDisplayOverlay: false,

  autoLoad: false,
  perPage: 25,

  getFilterQuery() {
    return {
      stockRequest: true,
      restrictMultiQuantity: this.get("settings.onlyDesignateSingletons")
    };
  },

  scannedItemWatcher: Ember.observer("searchInput", function() {
    const searchInput = this.get("searchInput") || "";
    const sanitizedString = this.sanitizeString(searchInput);
    if (sanitizedString) {
      this.set("searchText", sanitizedString);
    }
  }),

  scannedTextWatcher: Ember.observer("searchText", function() {
    this.set("searchInput", this.get("searchText"));
  }),

  triggerDisplayDesignateOverlay() {
    this.set("autoDisplayOverlay", true);
  },

  actions: {
    loadMoreItems(pageNo) {
      const params = this.trimQuery(
        _.merge(
          {},
          this.getFilterQuery(),
          this.getSearchQuery(),
          this.getPaginationQuery(pageNo)
        )
      );

      return this.get("store")
        .query("item", params)
        .then(results => {
          return results;
        });
    },

    clearSearch() {
      this.set("searchText", "");
    },

    displaySetItems(item) {
      this.set("itemSetId", item.get("itemId"));
      Ember.run.debounce(this, this.applyFilter, 0);
    }
  }
});
