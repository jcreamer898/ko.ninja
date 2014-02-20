/*global ActiveXObject, define */

(function (root, factory) {
    'use strict';

    // AMD
    if (typeof define === 'function' && define.amd) {
        define([], factory);

    // Non-AMD
    } else {
        factory(root.ko);
    }

} (this, function (ko) {

    'use strict';

    var Ajax = function (url, callbackFunction) {
      var self = this,
        uri;
      this.updating = false;

      this.abort = function() {
        if (self.updating) {
          self.updating = false;
          self.AJAX.abort();
          self.AJAX = null;
        }
      };

      this.update = function(passData, postMethod) {
        if (self.updating) {
            return false;
        }

        self.AJAX = null;
        if (window.XMLHttpRequest) {
          self.AJAX = new XMLHttpRequest();

        } else {
          self.AJAX = new ActiveXObject('Microsoft.XMLHTTP');
        }

        if (self.AJAX === null) {
          return false;

        } else {

          self.AJAX.onreadystatechange = function() {
            if (self.AJAX.readyState === 4) {
              self.updating = false;
              self.callback(self.AJAX.responseText,self.AJAX.status,self.AJAX.responseXML);
              self.AJAX = null;
            }
          };

          self.updating = new Date();

          if (/post/i.test(postMethod)) {
            uri = urlCall+'?'+self.updating.getTime();
            self.AJAX.open('POST', uri, true);
            self.AJAX.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            self.AJAX.send(passData);

          } else if (/put/i.test(postMethod)) {
            uri = urlCall+'?'+self.updating.getTime();
            self.AJAX.open('PUT', uri, true);
            self.AJAX.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            self.AJAX.send(passData);

          } else if (/delete/i.test(postMethod)) {
            uri = urlCall+'?'+self.updating.getTime();
            self.AJAX.open('DELETE', uri, true);
            self.AJAX.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            self.AJAX.send(passData);

          } else {
            uri = urlCall + '?' + passData + '&timestamp=' + (self.updating.getTime());
            self.AJAX.open('GET', uri, true);
            self.AJAX.send(null);
          }

          return true;
        }
      };

      var urlCall = url;
      this.callback = callbackFunction || function () {};

    };

    if (typeof define === 'function' && define.amd) {
      return Ajax;
    } else {
      ko.ninjaAjax = Ajax;
    }

}));