/*!
 * jQuery UI for edit in place forms
 * Author: juan081@gmail.com
 */

/*
this pluging  send json  {klass:a_string, data:{attr:value, attr:value}} to server 
and trigger 3 events on elememt(the same element as in $('selector').creating() call) in response from server, named 
 creatingsuccess
 creatingerror
 creatingcomplete
this attach 2 objects parameters event and data response from server to the event handler callback.


binding events example

$(selector).on('creatingerror',function(event, response){
  //do stuff with response
})


 */



;
(function($, window, document, app, undefined) {
  var Validations = window.APP.Validations;
  $.widget("factory.creating", {
    options: {
      dataFormStore: null,
      klass: null,
      urlTosave: null,
      nestedAttrIds: [],
      nestedAttrNames: [],
      nestedAttrs: null,
      nestedTranslateFromNamesToIds: {},
      nestedTranslateFromIdsToNames: {},
      nestedAs$: [],
      eChange: null,
      elememt: null,
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
        return this.data('data');
      },
      ajaxSuccess: function(response) {
        console.log("ajaxSuccess", response);
      },
      ajaxError: function(response) {
        console.log("ajaxError", response);
      }
    },



    tearUpEvent: function() {
      var nestedAttrs = this.getNestedAttrIds();
      self = this;
      var ev = this.options.eChange;
      var events = {};
      events[ev] = "_doAjax";
      this._on(this.element, events);
      if (nestedAttrs.length > 1) {
        $.each(this.allNestedAs$Objects(), function(index, id) {
          var el = $(id);
          self._on(el, events);
        });
      }
    },

    tearUpErrorsCleaner: function() {
      var cleaners = [];
      var targets = this.allNestedAs$Objects();
      targets.push(this.element);
      cleaners.push(new this.options.errorsCleaner(targets));
      this.cleaners = cleaners;
    },
    getOptions: function() {
      return this.options;
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
      return this.options.urlTosave || this.options.dataFormStore.data('url-create');
    },

    getFormStore: function() {
      return this.options.dataFormStore || $("#dataFormStore");
    },

    getData: function() {
      var dataToSend = {}
      dataToSend.klass = this.getKlass();
      dataToSend.id = this.objectId;
      dataToSend.data = {};
      dataToSend.data = this.options.extractData();
      dataToSend.data = this.sanitizedData();
      return dataToSend;
    },

    getNestedAttrs: function() {
      return this.options.nestedAttrs;
    },

    getNestedAttrNames: function() {
      return this.options.nestedAttrNames;
    },

    getNestedAttrIds: function() {
      return this.options.nestedAttrIds;
    },

    getNestedTranslateFromIdsToNames: function() {
      return this.options.nestedTranslateFromIdsToNames;
    },

    getNestedTranslateFromNamesToIds: function() {
      return this.options.nestedTranslateFromNamesToIds;
    },
    getNestedAs$: function() {
      return this.options.nestedAs$;
    },

    allNestedAs$Objects: function() {
      return $(this.getNestedAs$().toString());
    },

    sanitizedData: function() {

      var form = this.getForm().formParams()[this.getKlass()];
      var attrNames = this.getNestedAttrNames();
      var data = {};
      $.each(attrNames, function(index, key) {
        data[key] = form[key];
      });
      return data;
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



    _init: function() {

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
      $.each(this.allNestedAs$Objects(), function(index, el) {
        var validation = Validations.Simple($(el));
        validations.push(validation);
      });
      var validation = Validations.Simple(this.element);
      validations.push(validation);
      this.validForSend = validations;
    },
    _initializeElement: function() {

    },
    _initializeDefaults: function() {
      self = this;
      self.objectId = false;
      $.each(['klass', "nestedAttrs"], function(index, key) {
        self._initializeOrDefaultFromDataForm(key);
      });
      $.each(this.getNestedAttrs(), function(i, k) {
        self._addNestedAttrNameAndId(k.name, k.id);
      });
    },

    _addNestedAttrNameAndId: function(id, name) {
      ids = this.options.nestedAttrIds;
      names = this.options.nestedAttrNames;
      selectors = this.options.nestedAs$;
      ids.push(id);
      names.push(name);
      selectors.push("#" + id);
      this._addTranslate(id, name);
    },

    _initializeOrDefaultFromDataForm: function(key) {
      this.options[key] = this.options[key] || this._getFromDataForm(key);
    },

    _getFromDataForm: function(key) {
      return this.getDataFormStore()[key]
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

    _proxyExtractData: function() {
      var proxy = $.proxy(this.options.extractData, this.element);
      this.options.extractData = proxy;
    },
    _addTranslate: function(id, name) {
      var namesToIds = this.getNestedTranslateFromNamesToIds();
      var idsToNames = this.getNestedTranslateFromIdsToNames();
      idsToNames[id] = name;
      namesToIds[name] = id;
    },

    _preProcessDoAjax: function() {
      this.tearUpErrorsCleaner();
      $.each(this.cleaners, function(index, cleaner) {
        cleaner.run();
      })
    },
    _processObjectCreated: function(data) {
      this.objectId = data.id;
      this.getFormStore().attr('data-id', data.id);
      this.getFormStore().data('id', data.id);
    },

    _handleErrors: function(errors) {
      var ids = this.getNestedTranslateFromNamesToIds();
      var names = this.getNestedTranslateFromIdsToNames();
      var self = this;
      var errorHandler = function(el, errorAry) {
        var $el = $('#' + el);
        if ($el.length == 0) {
          var rexep = "[name='" + self.getKlass() + "[" + names[el] + "]']";
          $el = $(rexep);
        }
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
        var error = new errorHandler(ids[attr_name], msgs);
        error.show();
      });
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
          self._processObjectCreated(data);
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


})(jQuery, window, document, APP);