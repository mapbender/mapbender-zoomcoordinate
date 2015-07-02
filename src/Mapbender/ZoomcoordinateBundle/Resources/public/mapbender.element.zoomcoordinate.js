(function($) {

    $.widget("mapbender.mbAlkisSearchXY", {
        options: {
            dataSrs: 'EPSG:25832',
            spatialSearchSrs: 'EPSG:4326',
            type: 'dialog'
        },
        _create: function() {
            console.log(this.options);
            if (!Mapbender.checkTarget("mbAlkisSearchXY", this.options.target)) {
                return;
            }
            Mapbender.elementRegistry.onElementReady(this.options.target, $.proxy(this._setup, this));
        },
        _setup: function() {
            var title1 = this.options.prefix_x;
            if (title1.length > 0 ) {
                if(title1.slice(-1) !== ":") {
                    $(".mb-element-alkissearchxy-text").eq(1).html(title1 + " :"); 
                }
                else {
                    $(".mb-element-alkissearchxy-text").eq(1).html(title1);
                }
            }
            var title2 = this.options.prefix_y;
            if (title2.length > 0 ) {
                if(title2.slice(-1) !== ":") {
                    $(".mb-element-alkissearchxy-text").eq(2).html(title2 + " :"); 
                }
                else {
                    $(".mb-element-alkissearchxy-text").eq(2).html(title2);
                }
            }
            this.target = $("#" + this.options.target).data("mapbenderMbMap");//.getModel();
            //var mbMap = this.mapWidget.data('mapbenderMbMap');
            var options = "";
            var allSrs = this.target.getAllSrs();
//            for(var i = 0; i < allSrs.length; i++){
//                options += '<option value="' + allSrs[i].name + '">' + allSrs[i].title + '</option>';
//            }
            //
            this.dataSrsProj = this.target.getModel().getProj(this.options.dataSrs);
            this.spatialSearchSrsProj = this.target.getModel().getProj(this.options.spatialSearchSrs);
            this.elementUrl = Mapbender.configuration.application.urls.element + '/' + this.element.attr('id') + '/';
            this.mapClickHandler = new OpenLayers.Handler.Click(this,
                {
                    map: $('#' + this.options.target).data('mapQuery').olMap
                });
            if (this.options.autoActivate)
                this.activate();
            this._trigger('ready');
            this._ready();
        },
        /**
         * Default action for mapbender element
         */
        defaultAction: function(callback) {
            this.activate(callback);
        },
        testFunction: function() {
            console.log("testFunction");
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
            this.controlInput();
            this.getKoosystems();
            var self = this;
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
                                label: Mapbender.trans('Close'),
                                cssClass: 'button buttonCancel critical right mb-element-alkissearchxy-button',
                                callback: function() {
                                    var input = $(".mb-element-alkissearchxy-input");
                                    self.deactivate();
                                    input.eq(0).val();
                                    input.eq(1).val("");
                                    input.eq(2).val("");
                                }
                            },
                            'search': {
                                label: Mapbender.trans('Search'),
                                cssClass: 'button right mb-element-alkissearchxy-button',
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
            return this.element;
        },
        controlInput: function() {
            $(".mb-element-alkissearchxy-input").unbind('keyup').keyup(function() {
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
            var olMap = this.target.map.olMap;
            var srsselector = $("#srsselector option");
            var size = srsselector.length;
            var kosy = $("#alkissearchxy-kosy option");
            var kosyLength = kosy.length;

            if (kosyLength === 0) {
                var srs = new Array();
                var val = new Array();
                var selected = false;
                for (var i = 0; i < size; i++) {
                    srs[i] = srsselector.eq(i).text();
                    val[i] = srsselector.eq(i).val();
                    if (srsselector.eq(i).is("[selected]") === true) {
                        $("#alkissearchxy-kosy").append(
                            '<option value=' + val[i] + ' selected="selected">' + srs[i] + '</option>');
                        selected = true;
                    }
                    else {
                        $("#alkissearchxy-kosy").append('<option value=' + val[i] + '>' + srs[i] + '</option>');
                    }
                }
                if (selected === false) {
                    $("#alkissearchxy-kosy option").eq(0).attr("selected", "selected");
                    $("#srsselector option").eq(0).attr("selected", "selected");
                }
            }
            else {
                var selected = $("#srsselector option[selected='selected']");
                var val = selected.val();
                var altSelected = $("#alkissearchxy-kosy option[selected='selected']");
                var neuSelected = $('#alkissearchxy-kosy option[value="' + val + '"]');
                altSelected.removeAttr("selected");
                neuSelected.attr("selected", "selected");
                $(this).trigger('change');
            }
        },
        _findSuccess: function() {

            var input = $(".mb-element-alkissearchxy-input");
            var koSystemAlt = $('#alkissearchxy-kosy').find(":selected").val();
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
                xInput.val("");
                yInput.val("");
                var point = new OpenLayers.Geometry.Point(x, y);
//                debugger;
                point = point.transform(koSystemAlt, koSystemNeu);
                var newPoint = new OpenLayers.Geometry.Point(point.x, point.y);
                this._zoomToTarget(newPoint);
                $(".mb-element-alkissearchxy-input").css("border-color", "");

            }

        },
        _zoomToTarget: function(point) {
            this.deactivate();
            var olMap = this.target.map.olMap;
            $.proxy(this._zoom(olMap, true), this);
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

