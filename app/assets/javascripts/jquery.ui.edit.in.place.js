;
(function($, window, document, undefined) {

  var ValueExtractors = window.APP.ValueExtractors;
  var Validations = window.APP.Validations;

  $.widget("factory.editing", {
    options: {
      dataFormStore: null,
      klass: null,
      urlTosave: null,
      id: null,
      eChange: null,
      valueExtractor: function($el) {
        var extractor = new ValueExtractors.Simple($el);
        return extractor;
      },
      errorsCleaner: function(elememts) {
        return {
          elememts: elememts,
          run: function() {
            $.each(this.elememts, function(index, el) {
              $(el).parents('p').children('.error').remove();
            });
          }
        }
      },
      extractData: function() {
        return $(this).data();
      },
      ajaxSuccess: function(response) {
        console.log("ajaxSuccess", response);
      },
      ajaxError: function(response) {
        console.log("ajaxError", response);
      }
    },

    getOptions: function() {
      return this.options;
    },

    getFormStore: function() {
      return this.options.dataFormStore || $("#dataFormStore");
    },

    getData: function() {
      var dataToSend = {}
      dataToSend.klass = this.getKlass();
      dataToSend.id = this.getObjectId();
      dataToSend.data = {};
      dataToSend.data = this.options.extractData();
      dataToSend.data = this.sanitizedData();
      return dataToSend;
    },

    getObjectId: function() {
      return this.options.id;
    },

    getForm: function() {
      if (this.element.prop('tagName') == "FORM") {
        return this.element
      }
      return this.element.parents('form').first();
    },

    getKlass: function() {
      return this.options.klass;
    },

    getDataFormStore: function() {
      return this.options.dataFormStore.data();
    },

    getUrlTosave: function() {
      return this.options.urlTosave;
    },

    sanitizedData: function() {
      var form = this.getForm().formParams()[this.getKlass()];
      var myData = this.options.extractData();
      var attrName = [myData.attribute];
      var data = {};
      data[attrName] = this.valueExtractor.getValue();
      return data;
    },

    tearUpErrorsCleaner: function() {
      var cleaners = [];
      var targets = [];
      targets.push(this.element);
      cleaners.push(new this.options.errorsCleaner(targets));
      this.cleaners = cleaners;
    },

    tearUpEvent: function() {
      self = this;
      var ev = this.options.eChange;
      var events = {};
      events[ev] = "_doAjax";
      this._on(this.element, events);
    },

    validationsForSend: function() {
      return this.validForSend;
    },

    allValidSatisfied: function() {
      var valid = true;
      $.each(this.validationsForSend(), function(index, validation) {
        valid = valid && validation.getStatus();
      });
      return valid;
    },

    destroy: function() {
      $.Widget.prototype.destroy.call(this);
    },

    _setOption: function(key, value) {
      if (this.options[key] === value) {
        return this; // Do nothing, the value didn't change
      };
      switch (key) {
        case "processDataStore":

          break;
        case "extractData":
          this.options.extractData = value;
          this._proxyExtractData();
          break;
        case "dataStore":

          break;
        default:
          //this.options[ key ] = value;
          break;
      }
      this._super("_setOption", key, value);
    },

    _create: function() {
      this._initializeOrDefault('dataFormStore');
      this._initializeOrDefault('eChange');
      this._initializeDefaults();
      this._proxyExtractData();
      this.tearUpEvent();
      this._createValidations();
    },

    _createValidations: function() {
      var validations = [];
      var validation = Validations.Simple(this.element);
      validations.push(validation);
      this.validForSend = validations;
    },

    _initializeOrDefaultFromDataForm: function(key) {
      this.options[key] = this.options[key] || this._getFromDataForm(key);
    },

    _initializeDefaults: function() {
      self = this;
      $.each(['klass', 'id'], function(index, key) {
        self._initializeOrDefaultFromDataForm(key);
      });
      this.objectId = this.options.id;
      this._setUrlTosave();
      this._setObjectId();
      this.valueExtractor = this.options.valueExtractor(this.element);
    },

    _initializeOrDefault: function(value) {
      this.options[value] = this.options[value] || this._defaults(value);
    },

    _defaults: function(key) {
      var defaults = {
        dataFormStore: this.getFormStore(),
        eChange: "change"
      };
      return defaults[key];
    },
    _getFromDataForm: function(key) {
      return this.getDataFormStore()[key]
    },

    _setObjectId: function() {
      this.options.id = this.options.id || this.getDataFormStore().id;
    },

    _setUrlTosave: function() {
      this.options.urlTosave = this.options.urlTosave || this.getDataFormStore().urlUpdate;
    },

    _init: function() {

    },
    _proxyExtractData: function() {
      var proxy = $.proxy(this.options.extractData, this.element);
      this.options.extractData = proxy;
    },

    _handleErrors: function(errors) {
      var self = this;
      var errorHandler = function(el, errorAry) {
        var $el = $('#' + el);
        var msgs = errorAry;
        return {
          $el: $el,
          msgs: errorAry,
          show: function() {
            this.$el.parent().append("<span class='error'>" + errorAry.toString() + "</span>").show();
          }
        }
      };
      $.each(errors, function(attr_name, msgs) {
        var error = new errorHandler(self.element.attr('id'), msgs);
        error.show();
      });
    },

    _preProcessDoAjax: function() {
      this.tearUpErrorsCleaner();
      $.each(this.cleaners, function(index, cleaner) {
        cleaner.run();
      })
    },
    _processObjectEdited: function(data) {
      return
    },

    _doAjax: function() {
      var self = this;
      if (!self.allValidSatisfied()) {
        return
      };
      self._preProcessDoAjax();
      $.ajax({
        context: self,
        url: self.getUrlTosave(),
        data: $.param(self.getData()),
        type: 'POST',
        dataType: "json",
        success: function(data) {
          self._processObjectEdited(data);
          self.options.ajaxSuccess.call(this, data);
          self._trigger('success', null, data);
        },
        error: function(data) {
          try {
            var response = $.parseJSON(data.responseText);
            self._handleErrors(response.errors);
            self.options.ajaxError.call(this, response);
            self._trigger('error', null, response);
          } catch (e) {
            alert('Algo salió mal, contactese con soporte!');
          }
        }
      });
    },



  });
})(jQuery, window, document);