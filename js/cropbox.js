
"use strict";
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }
}(function ($) {
    var cropbox = function(options, el){
        var el = el || $(options.imageBox),
            obj =
            {
                state : {},
                ratio : 1,
                options : options,
                imageBox : el,
                thumbBox : el.find(options.thumbBox),
                spinner : el.find(options.spinner),
                image : new Image(),
                bgPos: {},
                getDataURL: function ()
                {
                    var width = this.thumbBox.width(),
                        height = this.thumbBox.height(),
                        canvas = document.createElement("canvas"),
                        dim = el.css('background-position').split(' '),
                        size = el.css('background-size').split(' '),
                        dx = parseInt(dim[0]) - el.width()/2 + width/2,
                        dy = parseInt(dim[1]) - el.height()/2 + height/2,
                        dw = parseInt(size[0]),
                        dh = parseInt(size[1]),
                        sh = parseInt(this.image.height),
                        sw = parseInt(this.image.width);

                    canvas.width = width;
                    canvas.height = height;
                    var context = canvas.getContext("2d");
                    context.drawImage(this.image, 0, 0, sw, sh, dx, dy, dw, dh);
                    var imageData = canvas.toDataURL('image/png');
                    return imageData;
                },
                getBlob: function()
                {
                    var imageData = this.getDataURL();
                    var b64 = imageData.replace('data:image/png;base64,','');
                    var binary = atob(b64);
                    var array = [];
                    for (var i = 0; i < binary.length; i++) {
                        array.push(binary.charCodeAt(i));
                    }
                    return  new Blob([new Uint8Array(array)], {type: 'image/png'});
                },
                zoomIn: function ()
                {
                    this.ratio*=1.1;
                    obj.ratio = obj.ratio >= 1 ? obj.ratio : 1;
                    setBackground();
                },
                zoomOut: function ()
                {
                    this.ratio*=0.9;
                    obj.ratio = obj.ratio >= 1 ? obj.ratio : 1;
                    setBackground();
                }
            },
            setBackground = function()
            {
                var w = parseInt(obj.image.width)*obj.ratio;
                var h = parseInt(obj.image.height)*obj.ratio;

                var pw = typeof obj.bgPos.x !== 'undefined' ? obj.bgPos.x : (el.width() - w) / 2;
                var ph = typeof obj.bgPos.y !== 'undefined' ? obj.bgPos.y : (el.height() - h) / 2;

                var minLeft = parseInt(obj.image.width)*(1 - obj.ratio);
                var minTop = parseInt(obj.image.height)*(1 - obj.ratio);

                // 边界限制
                if (pw > 0) {
                    pw = 0;
                } else if (pw < minLeft) {
                    pw = minLeft;
                }
                if (ph > 0) {
                    ph = 0;
                } else if (ph < minTop) {
                    ph = minTop;
                }
                el.css({
                    'background-image': 'url(' + obj.image.src + ')',
                    'background-size': w +'px ' + h + 'px',
                    'background-position': pw + 'px ' + ph + 'px',
                    'background-repeat': 'no-repeat'});
            },
            imgMouseDown = function(e)
            {
                event.preventDefault();
                e.stopImmediatePropagation();

                obj.state.dragable = true;
                obj.state.mouseX = e.clientX;
                obj.state.mouseY = e.clientY;
            },
            imgMouseMove = function(e)
            {
                e.stopImmediatePropagation();
                if (obj.state.dragable)
                {
                    var x = e.clientX - obj.state.mouseX;
                    var y = e.clientY - obj.state.mouseY;

                    var bg = el.css('background-position').split(' ');
                    var bgX = x + parseInt(bg[0]);
                    var bgY = y + parseInt(bg[1]);
                    obj.bgPos = {
                        x: bgX,
                        y: bgY
                    }
                    setBackground();

                    obj.state.mouseX = e.clientX;
                    obj.state.mouseY = e.clientY;
                }
            },
            imgMouseUp = function(e)
            {
                e.stopImmediatePropagation();
                obj.state.dragable = false;
            },
            zoomImage = function(e)
            {
                var prevRatio = obj.ratio;
                e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0 ? obj.ratio*=1.1 : obj.ratio*=0.9;
                obj.ratio = obj.ratio >= 1 ? obj.ratio : 1;
                // if (obj.ratio !== 1) {                
                //     var w = parseInt(obj.image.width)*(obj.ratio-prevRatio);
                //     var h = parseInt(obj.image.height)*(obj.ratio-prevRatio);
                //     obj.bgPos.x -= w/2;
                //     obj.bgPos.y -= h/2;
                // } else {
                //     obj.bgPos.x = obj.image.width;
                //     obj.bgPos.y = obj.image.height;
                // }
                
                if (obj.ratio !== 1) {                
                    var w = parseInt(obj.image.width)*(obj.ratio-prevRatio);
                    var h = parseInt(obj.image.height)*(obj.ratio-prevRatio);
                } else {
                    var w = 0;
                    var h = 0;
                }
                obj.bgPos.x -= w/2;
                obj.bgPos.y -= h/2;

                setBackground();
            }

        obj.spinner.show();
        obj.image.onload = function() {
            obj.spinner.hide();
            setBackground();

            el.unbind().bind('mousedown', imgMouseDown);
            el.bind('mousemove', imgMouseMove);
            $(window).bind('mouseup', imgMouseUp);
            el.bind('mousewheel DOMMouseScroll', zoomImage);
        };
        obj.image.src = options.imgSrc;
        el.on('remove', function(){$(window).unbind('mouseup', imgMouseUp)});

        return obj;
    };

    jQuery.fn.cropbox = function(options){
        return new cropbox(options, this);
    };
}));
