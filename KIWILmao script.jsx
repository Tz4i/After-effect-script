(function(thisObj) {
    scriptBuildUI(thisObj)
    function scriptBuildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window('palette', "KIWILmao", undefined, {
            resizeable: true
        });
        win.spacing = 0;


        // WIN
        // ===
        win.text = "KIWILmao";
        win.orientation = "column";
        win.alignChildren = ["center","top"];
        win.spacing = 10;
        win.margins = 10;

        // GROUP1
        // ======
        var group1 = win.add("group", undefined, {name: "group1"});
        group1.orientation = "column";
        group1.alignChildren = ["left","center"];
        group1.spacing = 5;
        group1.margins = 0;

        var button1 = group1.add("button", undefined, undefined, {name: "button1"});
        button1.text = "Adjustment layer";
        button1.preferredSize.width = 128;

        var button2 = group1.add("button", undefined, undefined, {name: "button2"});
        button2.text = "Null layer";
        button2.preferredSize.width = 128;

        var button3 = group1.add("button", undefined, undefined, {name: "button3"});
        button3.text = "Time remap";
        button3.preferredSize.width = 128;

        var button4 = group1.add("button", undefined, undefined, {name: "button4"});
        button4.text = "1 Framer";
        button4.preferredSize.width = 128;

        // Shared helper: returns the active comp, or null (with an alert) if invalid.
        function getActiveComp() {
            var comp = app.project.activeItem;
            if (comp == null || !(comp instanceof CompItem)) {
                alert("No composition selected");
                return null;
            }
            return comp;
        }

        // Shared helper: trims a newly created layer to span inpoint -> outpoint.
        //
        // Diagnostic finding on this AE build:
        //   - Setting outPoint is clean and independent.
        //   - Setting inPoint SLIDES the whole layer (it drags outPoint along
        //     by the same amount). So inPoint must NOT be used to trim.
        //
        // Correct approach:
        //   1. startTime = inpoint  -> anchors where the layer begins.
        //      (A fresh solid/null has a source in-point of 0, so once
        //       startTime is set, the visible in-point equals startTime.)
        //   2. outPoint = outpoint  -> sets the end cleanly. No side effect.
        //   inPoint is never assigned.
        function trimLayerTo(layer, inpoint, outpoint) {
            layer.startTime = inpoint;
            layer.outPoint = outpoint;
        }

        button1.onClick = function(){                        //adjlayer func
            addAdjLayer();
        }
        function addAdjLayer() {
            var comp = getActiveComp();
            if (comp == null) { return; }
            if (comp.selectedLayers[0] == null) {
                alert("Select the layer");
                return;
            }

            app.beginUndoGroup("My Process");

            var selectedLayers = comp.selectedLayers;
            var outpoint = 0;
            var index = Infinity;
            var inpoint = Infinity;
            var topLayer;

            for(var i = 0 ; i < selectedLayers.length; i++){
                if(selectedLayers[i].inPoint < inpoint){
                    inpoint = selectedLayers[i].inPoint;
                }
                if(selectedLayers[i].outPoint > outpoint){
                    outpoint = selectedLayers[i].outPoint;
                }
                if(selectedLayers[i].index < index){
                    index = selectedLayers[i].index;
                    topLayer = selectedLayers[i];
                }
            }

            var solidLayer = comp.layers.addSolid([1,1,1],"Adjustmentlayer",comp.width,comp.height,1,comp.duration);
            solidLayer.adjustmentLayer = true;
            trimLayerTo(solidLayer, inpoint, outpoint);
            solidLayer.label = 5;
            solidLayer.moveBefore(topLayer);
            app.endUndoGroup();
        }

        button2.onClick = function(){                       //NullLayer func
            addNullLayer();
        }

        function addNullLayer(){
            var comp = getActiveComp();
            if (comp == null) { return; }
            if (comp.selectedLayers[0] == null) {
                alert("Select the layer");
                return;
            }

            app.beginUndoGroup("My Process");

            var selectedlayer = comp.selectedLayers[0];
            var outpoint = selectedlayer.outPoint;
            var inpoint = selectedlayer.inPoint;
            var nullLayer = comp.layers.addNull(comp.duration);
            trimLayerTo(nullLayer, inpoint, outpoint);
            nullLayer.moveBefore(selectedlayer);
            selectedlayer.parent = nullLayer;
            app.endUndoGroup();
        }

        button4.onClick = function(){
            timeLine();
        }
        function timeLine(){
            var comp = getActiveComp();
            if (comp == null) { return; }
            if (comp.selectedLayers[0] == null) {
                alert("Select the layer");
                return;
            }

            app.beginUndoGroup("My Process");

            var framerate = 1/comp.frameRate;
            var selectedlayer = comp.selectedLayers[0];
            var inpoint = comp.time;
            var outpoint = comp.time + framerate;
            var solidLayer = comp.layers.addSolid([1,1,1],"1 Framer",comp.width,comp.height,1,comp.duration);
            solidLayer.adjustmentLayer = true;
            trimLayerTo(solidLayer, inpoint, outpoint);
            comp.time += framerate;
            solidLayer.label = 5;
            solidLayer.moveBefore(selectedlayer);
            app.endUndoGroup();
        }

        button3.onClick = function() {
            Timeremap();
        }
        function Timeremap(){
            var comp = getActiveComp();
            if (comp == null) { return; }
            if (comp.selectedLayers[0] == null) {
                alert("SELECT LAYER!!");
                return;
            }

            app.beginUndoGroup("My Process");

            var selectedLayer = comp.selectedLayers[0];
            var framerate = 1/comp.frameRate;
            var outpoint = selectedLayer.outPoint - framerate;
            var inpoint = selectedLayer.inPoint;
            selectedLayer.timeRemapEnabled = true;
            selectedLayer.property("ADBE Time Remapping").addKey(inpoint);
            selectedLayer.property("ADBE Time Remapping").addKey(outpoint);
            var easeIn = new KeyframeEase(0,25);
            var numKeyframes = selectedLayer.property("ADBE Time Remapping").numKeys;
            var keyTime = selectedLayer.property("ADBE Time Remapping").keyTime(1);
            var valueAtKeyframe = selectedLayer.property("ADBE Time Remapping").valueAtTime(keyTime, true);
            if(numKeyframes == 4){
                selectedLayer.property("ADBE Time Remapping").removeKey(1);
                selectedLayer.property("ADBE Time Remapping").removeKey(3);
            }
            else if(numKeyframes == 3 && valueAtKeyframe == 0){
                selectedLayer.property("ADBE Time Remapping").removeKey(3);
            }
            selectedLayer.property("ADBE Time Remapping").setTemporalEaseAtKey(1, [easeIn]);
            selectedLayer.property("ADBE Time Remapping").setTemporalEaseAtKey(2, [easeIn]);
            comp.frameBlending = true;
            selectedLayer.frameBlendingType = FrameBlendingType.PIXEL_MOTION;

            app.endUndoGroup();
        }



        win.onResizing = win.onResize = function() {
            this.layout.resize();
        };

        win instanceof Window
            ?
            (win.center(), win.show()) : (win.layout.layout(true), win.layout.resize());
    }

})(this);
