(function($) {

    $.widget("mapbender.mbZoomcoordinate", {
        options: {
            dataSrs: 'EPSG:25832',
            spatialSearchSrs: 'EPSG:4326',
            type: 'dialog'
        },
        _create: function() {
            if (!Mapbender.checkTarget("mbZoomcoordinate", this.options.target)) {
                return;
            }
            Mapbender.elementRegistry.onElementReady(this.options.target, $.proxy(this._setup, this));
        },
        _setup: function() {
            var prefix_proj = this.options.prefix_projection;
            if (prefix_proj !== null) {
                $(".mb-element-zoomcoordinate-text").eq(0).html(prefix_proj);
            }
            var title1 = this.options.prefix_x;
            if (title1 !== null) {
                $(".mb-element-zoomcoordinate-text").eq(1).html(title1);
            }
            var title2 = this.options.prefix_y;
            if (title2 !== null) {
                $(".mb-element-zoomcoordinate-text").eq(2).html(title2);
            }
            this.target = $("#" + this.options.target).data("mapbenderMbMap");
            var options = "";
            var allSrs = this.target.getAllSrs();
            
            this.dataSrsProj = this.target.getModel().getProj(this.options.dataSrs);
            this.spatialSearchSrsProj = this.target.getModel().getProj(this.options.spatialSearchSrs);
            this.elementUrl = Mapbender.configuration.application.urls.element + '/' + this.element.attr('id') + '/';
            this.mapClickHandler = new OpenLayers.Handler.Click(this,
                {
                    map: $('#' + this.options.target).data('mapQuery').olMap
                });
                
            if(this.options.type === 'element') {
                $(".mb-element-zoomcoordinate").removeClass("hidden");
                $(".mb-element-zoomcoordinate-input").addClass("zoomcoordinate-sidepane");
                $(".mb-element-zoomcoordinate").append("<a href='#mbpopup-0/button/search' class='button right mb-element-zoomcoordinate-button zoomcoordinate-sidepane-ok'>Ok</a>");
                $(".mb-element-zoomcoordinate").append("<a href='#mbpopup-0/button/close' class='button buttonCancel critical right mb-element-zoomcoordinate-button zoomcoordinate-sidepane-clear'>Clear</a>");
                $(".mb-element-zoomcoordinate-text").css("font-size", "13px");
                
                this.activate();
            }
            else {
                $(".zoomcoordinate-sidepane-ok").remove();
                $(".zoomcoordinate-sidepane-clear").remove();
                $(".mb-element-zoomcoordinate").addClass("hidden");
                $(".mb-element-zoomcoordinate").removeClass("zoomcoordinate-sidepane");
                
            }
               
            if (this.options.autoActivate)
                this.activate();
            this._trigger('ready');
            this._ready();
        },
        
        defaultAction: function(callback) {
            this.activate(callback);
        },
        activate: function(callback) {
            this.callback = callback ? callback : null;
            this._getContext();
        },
        deactivate: function() {
            if (this.popup) {
                if (this.popup.$element) {
                    $('body').append(this.element.addClass('hidden'));
                    this.popup.destroy();
                }
                this.popup = null;
            }
            this.callback ? this.callback.call() : this.callback = null;
        },
        _getContext: function() {
            
            var self = this;
            this.controlInput();
            this.getKoosystems();
            
            var self = this;
            
            if(this.options.type === 'element') {
                $(".zoomcoordinate-sidepane-ok").click(function(){
                    self._findSuccess();
                }); 
                $(".zoomcoordinate-sidepane-clear").click(function(){
                    $(".mb-element-zoomcoordinate-input").eq(1).val("");
                    $(".mb-element-zoomcoordinate-input").eq(2).val("");
                    if(self.MarkerLayer) {
                        self.MarkerLayer.clearMarkers();
                    }
                });
            }
            else {
                if (this.options.type === 'dialog') {
                    if (!this.popup || !this.popup.$element) {
                        this.popup = new Mapbender.Popup2({
                            title: self.element.attr('data-title'),
                            draggable: true,
                            modal: false,
                            closeButton: false,
                            closeOnESC: false,
                            content: this.element.removeClass('hidden'),
                            resizable: true,
                            width: 450,
                            height: 400,
                            buttons: {
                                'close': {
                                    label: Mapbender.trans('Cancel'),
                                    cssClass: 'button buttonCancel critical right mb-element-zoomcoordinate-button',
                                    callback: function() {
                                        var input = $(".mb-element-zoomcoordinate-input");
                                        self.deactivate();
                                        input.eq(0).val();
                                        input.eq(1).val("");
                                        input.eq(2).val("");
                                        if(self.MarkerLayer) {
                                            self.MarkerLayer.clearMarkers();
                                        }
                                    }
                                },
                                'search': {
                                    label: Mapbender.trans('Ok'),
                                    cssClass: 'button right mb-element-zoomcoordinate-button',
                                    callback: function() {
                                        self._findSuccess();
                                    }
                                }
                            }
                        });
                        this.popup.$element.on('close', function() {
                            self.deactivate();
                        });
                        this.popup.$element.on('open', function() {
                            self.state = 'opened';
                        });
                    }
                    this.popup.open();
                }
            }
            return this.element;
        },
        controlInput: function() {
            $(".mb-element-zoomcoordinate-input").unbind('keyup').keyup(function() {
                var last = this.value.split("").pop();
                var first = this.value.charAt(0);
                if (first === ',' || first === '.') {
                    this.value = this.value.replace(/[^0-9]/g, '');
                }
                var substring = this.value.substring(0, this.value.length -1);
                if ((last === "," || last === ".") && (substring.indexOf('.') !== -1 || substring.indexOf(',') !== -1)) {
                    this.value = this.value.substring(0, this.value.length -1);
                }
                else {
                    this.value = this.value.replace(/[^0-9\.,]/g, '');
                }
            });
        },
        getKoosystems: function() {
            
            this.mapWidget = $('#' + this.options.target);
            var mbMap = this.mapWidget.data('mapbenderMbMap');
            var options = "";
            var allSrs = mbMap.getAllSrs();
           
            if ($("#zoomcoordinate-kosy option").length < 1) {
                $("#zoomcoordinate-kosy").append(
                                '<option value=' + allSrs[0].name + ' selected="selected">' + allSrs[0].title + '</option>');
                for (var i = 1; i < allSrs.length; i++) {
                    $("#zoomcoordinate-kosy").append(
                                '<option value=' + allSrs[i].name + '>' + allSrs[i].title + '</option>');

                }
            }
        },
        _findSuccess: function() {

            var input = $(".mb-element-zoomcoordinate-input");
            var koSystemAlt = $('#zoomcoordinate-kosy').find(":selected").val();
            var koSystemNeu = $('#srsselector').find(":selected").val();
            var xInput = input.eq(1);
            var yInput = input.eq(2);
            var olMap = this.target.map.olMap;

            var x = xInput.val();
            var y = yInput.val();

            var fillField = function(coord, input) {
                if (coord === "") {
                    input.css("border-color", "red");
                }
                else {
                    input.css("border-color", "");
                }
            };
            fillField(x, xInput);
            fillField(y, yInput);

            if (x === "" || y === "") {
                Mapbender.info('Bitte überprüfen sie Ihre Eingabe');
            }
            else {
                var point = new OpenLayers.Geometry.Point(x, y);
                point = point.transform(koSystemAlt, koSystemNeu);
                var newPoint = new OpenLayers.Geometry.Point(point.x, point.y);
                this._zoomToTarget(newPoint);
                $(".mb-element-zoomcoordinate-input").css("border-color", "");

            }

        },
        _zoomToTarget: function(point) {
            this.deactivate();
            var olMap = this.target.map.olMap;
            // $.proxy(this._zoom(olMap, true), this);
            $.proxy(this._setCenter(point, olMap), this);
        },
        _zoom: function(map, first) {
            if (first === true) {
                var zoom = map.getZoom();
                if (zoom > 2) {
                    map.zoomTo(2);
                }
            }
            else {
                map.zoomTo(5);
            }
        },
        _setCenter: function(point, map) {
            
            var targetCoord = new OpenLayers.LonLat(point.x, point.y);
            map.setCenter(targetCoord);

            var olMap = map;
            var coordinates = {
                pixel: {
                    x: point.x,
                    y: point.y
                },
                world: {
                    x: targetCoord.lon,
                    y: targetCoord.lat
                }
            };
            if(!this.MarkerLayer) {
                this.MarkerLayer = new OpenLayers.Layer.Markers();
                this.target.map.olMap.addLayer(this.MarkerLayer);
            }
            this.MarkerLayer.clearMarkers();
            var poiMarker = new OpenLayers.Marker(targetCoord, new OpenLayers.Icon(
                Mapbender.configuration.application.urls.asset +
                    this.target.options.poiIcon.image, {
                        w: this.target.options.poiIcon.width,
                        h: this.target.options.poiIcon.height
                    }, {
                        x: this.target.options.poiIcon.xoffset,
                        y: this.target.options.poiIcon.yoffset
                    }));
            this.MarkerLayer.addMarker(poiMarker);
            
            $.proxy(this._zoom(map), false);

        },
        _findError: function(response) {
            Mapbender.error(response);
        },
        _getIframeDeclaration: function(uuid, url) {
            var id = uuid ? (' id="' + uuid + '"') : '';
            var src = url ? (' src="' + url + '"') : '';
            return '<iframe class="alkisInfoFrame"' + id + src + '></iframe>'
        },
        /**
         *
         */
        ready: function(callback) {
            if (this.readyState === true) {
                callback();
            } else {
                this.readyCallbacks.push(callback);
            }
        },
        /**
         *
         */
        _ready: function() {
            for (callback in this.readyCallbacks) {
                callback();
                delete(this.readyCallbacks[callback]);
            }
            this.readyState = true;
        },
        _destroy: $.noop
    });
})(jQuery);

