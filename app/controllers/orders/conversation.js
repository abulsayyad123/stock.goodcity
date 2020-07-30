import Ember from "ember";
import config from "stock/config/environment";
import detail from "./detail";
import MessageBase from "stock/mixins/messages_base";

export default detail.extend(MessageBase, {
  isPrivate: false,
  backLinkPath: "",
  isMobileApp: config.cordova.enabled,
  itemIdforHistoryRoute: null,
  organisationIdforHistoryRoute: null,
  i18n: Ember.inject.service(),
  model: null,
  noMessage: Ember.computed.empty("messages"),
  isMentionsActive: false,

  displayChatNote: Ember.computed(
    "noMessage",
    "disabled",
    "isMentionsActive",
    function() {
      return (
        this.get("noMessage") &&
        !this.get("isMentionsActive") &&
        !this.get("disabled")
      );
    }
  ),

  on() {
    this.get("subscription").on("change:message", this, this.markReadAndScroll);
  },

  off() {
    this.get("subscription").off(
      "change:message",
      this,
      this.markReadAndScroll
    );
  },

  markReadAndScroll: function({ record }) {
    this.markMessageAsRead(record);
    this.scrollToBottom();
  },

  scrollToBottom() {
    if (!Ember.$(".message-textbar").length) {
      return;
    }

    let scrollOffset = Ember.$(document).height();
    let screenHeight = document.documentElement.clientHeight;
    let pageHeight = document.documentElement.scrollHeight;

    if (pageHeight > screenHeight) {
      Ember.run.later(this, function() {
        window.scrollTo(0, scrollOffset);
      });
    }
  },

  actions: {
    sendMessage() {
      Ember.$("textarea").trigger("blur");
      let values = this.prepareMessageObject("Order");
      this.createMessage(values);
    }
  }
});
