import Ember from "ember";

export default Ember.Service.extend({

  getOrderStateFilters() {
    return JSON.parse(window.localStorage.getItem('orderStateFilters'));
  },

  getOrderTypeFilters() {
    return JSON.parse(window.localStorage.getItem('orderTypeFilters'));
  },

  isPriority() {
    if (this.getOrderStateFilters()) {
      return this.getOrderStateFilters().indexOf('showPriority') >= 0;
    }
  },

  setStateTypeFilter(states) {
    window.localStorage.setItem('orderStateFilters', JSON.stringify(states));
  },

  clearFilters() {
    window.localStorage.removeItem('orderStateFilters');
    window.localStorage.removeItem('orderTypeFilters');
  }

});
