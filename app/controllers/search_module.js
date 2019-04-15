import Ember from "ember";
import InfinityRoute from "ember-infinity/mixins/route";

export default Ember.Controller.extend(InfinityRoute, {
  filterService: Ember.inject.service(),
  utilityMethods: Ember.inject.service(),

  getCurrentUser: Ember.computed(function() {
    var store = this.get("store");
    var currentUser = store.peekAll("user_profile").get("firstObject") || null;
    return currentUser;
  }).volatile(),

  sanitizeString(str) {
    // these are the special characters '.,)(@_-' that are allowed for search
    // '\.' => will allow '.'
    // '\(' => will allow '('
    // '\@' => will allow '@'
    // '\)' => will allow ')'
    str = str.replace(/[^a-z0-9áéíóúñü \.,\)\(@_-]/gim, "");
    return str.trim();
  },

  searchText: Ember.computed("searchInput", {
    get() {
      return this.get("searchInput") || "";
    },

    set(key, value) {
      return this.sanitizeString(value);
    }
  }),

  i18n: Ember.inject.service(),
  store: Ember.inject.service(),
  isLoading: false,
  hasNoResults: false,
  itemSetId: null,
  unloadAll: false,
  minSearchTextLength: 0,
  searchInput: null,
  toDesignateItem: null,
  excludeAssociations: true,
  requestOptions: {},

  hasSearchText: Ember.computed("searchText", function() {
    return !!this.get("searchText");
  }),

  onSearchTextChange: Ember.observer("searchText", function() {
    // wait before applying the filter
    if (this.get("searchText").length > this.get("minSearchTextLength")) {
      this.set("itemSetId", null);
      Ember.run.debounce(this, this.applyFilter, 500);
    } else {
      this.set("filteredResults", []);
    }
  }),

  buildQueryParamMap() {
    let queryParamDefinitions = {
      searchText: "searchText",
      itemId: "itemSetId",
      toDesignateItem: "toDesignateItem",
      shallow: "excludeAssociations"
    };
    for (var key in this.requestOptions) {
      queryParamDefinitions[key] = `requestOptions.${key}`;
    }
    return queryParamDefinitions;
  },

  onFilterChange() {
    if (this.get("searchText").length > this.get("minSearchTextLength")) {
      this.set("itemSetId", null);
      Ember.run.debounce(this, this.applyFilter, 500);
    }
  },

  applyFilter() {
    var searchText = this.get("searchText");
    let filterService = this.get("filterService");
    let utilities = this.get("utilityMethods");
    let UNLOAD_MODELS = ["designation", "item", "location", "code"];

    if (searchText.length > 0) {
      this.set("isLoading", true);
      this.set("hasNoResults", false);
      if (this.get("unloadAll")) {
        UNLOAD_MODELS.forEach(model => this.store.unloadAll(model));
      }

      let filter = filterService.get("orderStateFilters");

      let isPriority = filterService.isPriority();
      if (isPriority) {
        filter.shift();
      }
      let typesFilter = filterService.get("orderTypeFilters");
      const paginationOpts = {
        perPage: 25,
        startingPage: 1,
        modelPath: "filteredResults",
        stockRequest: true,
        state: utilities.stringifyArray(filter),
        type: utilities.stringifyArray(typesFilter),
        priority: isPriority
      };
      this.infinityModel(
        this.get("searchModelName"),
        paginationOpts,
        this.buildQueryParamMap()
      )
        .then(data => {
          if (this.get("searchText") === data.meta.search) {
            this.set("filteredResults", data);
            this.set("hasNoResults", data.get("length") === 0);
          }
        })
        .finally(() => this.set("isLoading", false));
    }
    this.set("filteredResults", []);
  },

  afterInfinityModel(records) {
    var searchText = this.get("searchText");
    if (searchText.length === 0 || searchText !== records.meta.search) {
      records.replaceContent(0, 25, []);
    }
  },

  actions: {
    clearSearch() {
      this.set("searchText", "");
    }
  }
});
