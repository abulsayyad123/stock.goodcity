import Ember from "ember";
import { regex } from "stock/constants/regex";
import AsyncMixin, { ERROR_STRATEGIES } from "stock/mixins/async";
import TitleAndLanguageMixin from "stock/mixins/grades_option";
import ImageUploadMixin from "stock/mixins/image_upload";

export default Ember.Controller.extend(
  AsyncMixin,
  ImageUploadMixin,
  TitleAndLanguageMixin,
  {
    user: Ember.computed.alias("model.user"),
    userService: Ember.inject.service(),

    invalidEmail: Ember.computed("user.email", function() {
      const emailRegEx = new RegExp(regex.EMAIL_REGEX);
      // let email = this.get("user.email");
      // return /^[^@\s]+@[^@\s]+/.test(email);
      return this.get("user.email").match(emailRegEx);
    }),

    invalidMobile: Ember.computed("mobile", function() {
      const hkMobileNumberRegEx = new RegExp(regex.HK_MOBILE_NUMBER_REGEX);
      return this.get("mobile").match(hkMobileNumberRegEx);
    }),

    mobile: Ember.computed("user.mobile", {
      get() {
        let phoneNumber =
          this.get("user.mobile") && this.get("user.mobile").slice(4);
        return phoneNumber;
      },
      set(key, value) {
        return value;
      }
    }),

    districts: Ember.computed(function() {
      return this.get("store")
        .peekAll("district")
        .sortBy("name");
    }),

    getUpdatedDistrictParams() {
      let address_attributes = {
        district_id: this.get("user.associatedDistrict.id") || null
      };
      return { address_attributes };
    },

    saveImage() {
      let image = this.get("newUploadedImage");
      if (image) {
        return image.save();
      }
    },

    actions: {
      updateUserDetails(e) {
        let value = e.target.value.trim();
        let isValid;
        if (this.get("mobile")) {
          this.set("user.mobile", "+852" + this.get("mobile"));
        } else {
          this.set("user.mobile", this.get("mobile"));
        }
        if (Object.keys(this.get("user").changedAttributes()).length === 0) {
          this.set(`${e.target.id}InputError`, false);
          this.set(`${e.target.id}ValidationError`, false);
          return;
        }
        switch (e.target.id) {
          case "firstName":
            isValid = Boolean(value);
            break;
          case "lastName":
            isValid = Boolean(value);
            break;
          case "email":
            isValid = value
              ? Boolean(this.get("invalidEmail"))
              : Boolean(this.get("invalidMobile"));
            break;
          case "mobile":
            isValid = value
              ? Boolean(this.get("invalidMobile"))
              : Boolean(this.get("invalidEmail"));
            break;
        }
        if (isValid) {
          this.runTask(async () => {
            let user = this.get("user");
            value = e.target.id == "mobile" && value ? "+852" + value : value;
            user.set(e.target.id, value);
            await user.save();
            this.set(`${e.target.id}InputError`, false);
            this.set(`${e.target.id}ValidationError`, false);
          }, ERROR_STRATEGIES.MODAL);
        } else {
          this.get("user").rollbackAttributes();
          Ember.$(`#${e.target.id}`).focus();
          return e.target.value
            ? this.set(`${e.target.id}ValidationError`, true)
            : this.set(`${e.target.id}InputError`, true);
        }
      },

      uploadEditedImageSuccess(e, data) {
        var identifier =
          data.result.version +
          "/" +
          data.result.public_id +
          "." +
          data.result.format;
        var newUploadedImage = this.get("store").createRecord("image", {
          cloudinaryId: identifier,
          favourite: true
        });
        this.set("newUploadedImage", newUploadedImage);
        this.set("userImageKeys", identifier);

        if (this.get("newUploadedImage")) {
          this.send("saveEditedImage");
        }
      },

      saveEditedImage() {
        return this.runTask(async () => {
          let user = this.get("user");
          let image = await this.get("userService").saveImage(
            this.get("newUploadedImage")
          );
          user.set("image", image);
          user.save();
        }, ERROR_STRATEGIES.MODAL);
      },

      deleteImage() {
        this.runTask(async () => {
          let user = this.get("user");
          if (user.get("image")) {
            await this.get("userService").deleteImage(user.get("image"));
          }
          let data = await this.get("userService").editUser(user.get("id"), {
            user: { image_id: null }
          });
          this.get("store").pushPayload(data);
        }, ERROR_STRATEGIES.MODAL);
      },

      changeDistrict() {
        return this.runTask(async () => {
          const id = this.get("user.id");
          let data = await this.get("userService").editUser(id, {
            user: this.getUpdatedDistrictParams()
          });
          this.get("store").pushPayload(data);
        }, ERROR_STRATEGIES.MODAL);
      }
    }
  }
);
