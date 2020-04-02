var Main, VariablePanel, getCookie, setCookie;
var mini3pi, background;
var canvasBackground = null;
var wantDelay = false, wantDelayTime = 0;
var ctx, ctxBackground;
var backgroundData;
var paused = true;
var simulationScreen;


var pololu3piSensors = Array();
var pololu3piSensorsResult = 0;

var sim3pi = {
  x : 0,
  y : 0,
  rotation : 0,
  width : 30,
  height : 30,
  dragging : false,
  fill : true
};

setCookie = function(cname, cvalue) {
  return document.cookie = encodeURIComponent(cname) + "=" + encodeURIComponent(cvalue) + "; ";
};

getCookie = function(cname) {
  var c, ca, j, len, name;
  name = encodeURIComponent(cname) + "=";
  ca = document.cookie.split(';');
  for (j = 0, len = ca.length; j < len; j++) {
    c = ca[j];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return decodeURIComponent(c.substring(name.length, c.length));
    }
  }
};

VariablePanel = React.createClass({
  displayName: "VariablePanel",
  render: function() {
    var i, j, last, lastVar, lastVars, lastVarsMap, len, mydebugger, ref, updated, v, vars;
    mydebugger = this.props["debugger"];
    ref = this.props, vars = ref.vars, lastVars = ref.lastVars;
    lastVarsMap = {};
    for (j = 0, len = lastVars.length; j < len; j++) {
      lastVar = lastVars[j];
      lastVarsMap[lastVar.name] = lastVar;
    }
    return React.createElement(Table, {
      "striped": true,
      "bordered": true,
      "hover": true
    }, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", null, "Name"), React.createElement("th", null, "Value"), React.createElement("th", null, "Type"))), React.createElement("tbody", null, (function() {
      var k, len1, results;
      results = [];
      for (i = k = 0, len1 = vars.length; k < len1; i = ++k) {
        v = vars[i];
        last = lastVarsMap[v.name];
        updated = (last == null) || last.value !== v.value || last.type !== v.type;
        results.push(React.createElement("tr", {
          "key": v.name,
          "className": (updated ? "updated-variable-item" : void 0)
        }, React.createElement("td", null, v.name), React.createElement("td", null, v.value), React.createElement("td", null, v.type)));
      }
      return results;
    })()));
  }
});

var preCode =  "#include <iostream>\n";
preCode += "using namespace std;\n"
//preCode += "#include <OrangutanLCD.h>\n";
//preCode += "#include <OrangutanBuzzer.h>\n";
//preCode += "#include <OrangutanPushbuttons.h>\n";
//preCode += "#include <OrangutanAnalog.h>\n";
//preCode += "#include <OrangutanLEDs.h>\n";
//preCode += "#include <OrangutanMotors.h>\n";
preCode += "#define IR_EMITTERS_ON 1\n";
preCode += "#define BUTTON_A 0\n";
preCode += "#define BUTTON_B 1\n";
preCode += "#define BUTTON_C 2\n";
preCode += "#define LOW 0\n";
preCode += "#define HIGH 1\n";
preCode += "OrangutanLCD2 OrangutanLCD;\n";
preCode += "OrangutanBuzzer2 OrangutanBuzzer;\n";
preCode += "OrangutanPushbuttons2 OrangutanPushbuttons;\n";
preCode += "OrangutanAnalog2 OrangutanAnalog;\n";
preCode += "OrangutanLEDs2 OrangutanLEDs;\n";
preCode += "OrangutanMotors2 OrangutanMotors;\n\n";
preCode += "void delay(int t){\nint a = t;\n/*TODO*/}\n";

var result = result = `/*
* Simple3piLineFollower - demo code for the Pololu 3pi Robot
* 
* This code will follow a black line on a white background, using a
* very simple algorithm.  It demonstrates auto-calibration and use of
* the 3pi IR sensors, motor control, bar graphs using custom
* characters, and music playback, making it a good starting point for
* developing your own more competitive line follower.
*
* http://www.pololu.com/docs/0J21
* http://www.pololu.com
* http://forum.pololu.com
*
*/

// The 3pi include file must be at the beginning of any program that
// uses the Pololu AVR library and 3pi.  Pololu3pi.h includes all of the
// other Orangutan Arduino libraries that can be used to control the
// on-board hardware such as LCD, buzzer, and motor drivers.
#include <Pololu3pi.h>
#include <PololuQTRSensors.h>
#include <OrangutanMotors.h>
#include <OrangutanAnalog.h>
#include <OrangutanLEDs.h>
#include <OrangutanLCD.h>
#include <OrangutanPushbuttons.h>
#include <OrangutanBuzzer.h>

Pololu3pi robot;
unsigned int sensors[5]; // an array to hold sensor values

// Initializes the 3pi, displays a welcome message, calibrates, and
// plays the initial music.  This function is automatically called
// by the Arduino framework at the start of program execution.
void setup()
{
 unsigned int counter; // used as a simple timer

 // This must be called at the beginning of 3pi code, to set up the
 // sensors.  We use a value of 2000 for the timeout, which
 // corresponds to 2000*0.4 us = 0.8 ms on our 20 MHz processor.
 robot.init(2000);

 // Auto-calibration: turn right and left while calibrating the
 // sensors.
 for (counter=0; counter<80; counter++)
 {
   if (counter < 20 || counter >= 60)
     OrangutanMotors.setSpeeds(40, -40);
   else
     OrangutanMotors.setSpeeds(-40, 40);

   // This function records a set of sensor readings and keeps
   // track of the minimum and maximum values encountered.  The
   // IR_EMITTERS_ON argument means that the IR LEDs will be
   // turned on during the reading, which is usually what you
   // want.
   robot.calibrateLineSensors(IR_EMITTERS_ON);

   // Since our counter runs to 80, the total delay will be
   // 80*20 = 1600 ms.
   delay(20);
 }
 OrangutanMotors.setSpeeds(0, 0);
}

// The main function.  This function is repeatedly called by
// the Arduino framework.
void loop()
{
 // Get the position of the line.  Note that we *must* provide
 // the "sensors" argument to read_line() here, even though we
 // are not interested in the individual sensor readings.
 unsigned int position = robot.readLine(sensors, IR_EMITTERS_ON);
 if (position < 1000)
 {
   // We are far to the right of the line: turn left.

   // Set the right motor to 100 and the left motor to zero,
   // to do a sharp turn to the left.  Note that the maximum
   // value of either motor speed is 255, so we are driving
   // it at just about 40% of the max.
   OrangutanMotors.setSpeeds(0, 100);

   // Just for fun, indicate the direction we are turning on
   // the LEDs.
   OrangutanLEDs.left(HIGH);
   OrangutanLEDs.right(LOW);
 }
 else if (position < 3000)
 {
   // We are somewhat close to being centered on the line:
   // drive straight.
   OrangutanMotors.setSpeeds(100, 100);
   OrangutanLEDs.left(HIGH);
   OrangutanLEDs.right(HIGH);
 }
 else
 {
   // We are far to the left of the line: turn right.
   OrangutanMotors.setSpeeds(100, 0);
   OrangutanLEDs.left(LOW);
   OrangutanLEDs.right(HIGH);
 }
}`;
//result += "void simPrint(char t){/*TODO*/}\n";
//result += "void simPrint(char* t){/*TODO*/}\n";
//result += "void simPrint(int t){/*TODO*/}\n";
//result += fr.result;
result = result.replace(/::/g, ".");
result = result.replace(/ PROGMEM/g, "");
result = result.replace(/\\xf7 /g, "pi");
result = result.replace(/OrangutanLCD.print\(( |[A-Z]|[a-z]|'|[0-9]|"|!)*\);/g, ""); // remove as chamadas de print pois não há overloading implementado
//result = result.replace(/while\(OrangutanBuzzer::isPlaying\(\)\);/g, "");
result = result.replace("while(OrangutanBuzzer.isPlaying());", ""); // por algum motivo ele nao entende a construcao while(algo); // tive que remover
var postCode = "\nint main() {\n";
postCode += "\tsetup();\n";
postCode += "\twhile(true){\n";
postCode += "\t\tloop();\n";
postCode += "\t}\n";
postCode += "\treturn 0;\n";
postCode += "}\n";


var trackOptions = [
  {track:"track1",
   name:"Circular",
   start:{x:40.0,y:0.0,ang:0.0}},
  {track:"track2",
   name:"Não Circular",
   start:{x:38.0,y:+0.5,ang:-0.02}},
];

Main = React.createClass({
  displayName: "Main",
  getInitialState: function() {
    // console.log(this.parentElement());
    return {
      code: this.defaultCode,
      output: "",
      input: "5",
      status: "editing",
      markers: [],
      vars: [],
      lastVars: []
    };
  },
  //defaultCode: "#include <iostream>\nusing namespace std;\nint main() {\n    int a;\n    cin >> a;\n    cout << a*10 << endl;\n    return 0;\n}",
  defaultCode: result,
  componentDidMount: function() {
    jQuery.hotkeys.options.filterInputAcceptingElements = false;
    jQuery.hotkeys.options.filterContentEditable = false;
    $(document).bind("keydown", "ctrl+s", this.quickSave);
    return $(document).bind("keydown", "ctrl+o", this.quickLoad);
  },
  onChange: function(code) {
    return this.setState({
      code: code
    });
  },
  quickSave: function(e) {
    if (e != null) {
      e.preventDefault();
    }
    return this.refs.hiddenfile2.getDOMNode().click();
    //return setCookie("code", this.state.code);
  },
  quickLoad: function(e) {
    if (e != null) {
      e.preventDefault();
    }
    return this.setState({
      code: getCookie("code")
    });
  },
  handleError: function(e) {
    return this.setState({
      output: this.output + "\n" + e
    });
  },
  loadTrack: function(trackNumber){
    console.log(trackOptions[trackNumber]);
    loadTrack(trackNumber);
  },
  run: function(debug, e) {
    var code, config, exitCode, input;
    e.preventDefault();
    code = preCode;
    code += this.state.code;
    code += postCode;
    input = this.state.input;
    this.output = "";
    config = {
      stdio: {
        drain: function() {
          var x;
          x = input;
          input = null;
          return x;
        },
        write: (function(_this) {
          return function(s) {
            _this.output += s;
            _this.setState({
              output: _this.output
            });
          };
        })(this)
      },
      debug: debug
    };
    if (debug) {
      this.preDebug();
      try {
        // console.log(code);
        this["debugger"] = JSCPP.run(code, input, config);
        return this.startDebug();
      } catch (error) {
        e = error;
        this.handleError(e);
        return this.debug_stop();
      }
    } else {
      this.preRun();
      try {
        exitCode = JSCPP.run(code, input, config);
        return this.postRun(exitCode);
      } catch (error) {
        e = error;
        this.handleError(e);
        return this.setState({
          status: "editing"
        });
      }
    }
  },
  preDebug: function() {
    this.codeBackup = this.state.code;
    return this.setState({
      output: "",
      status: "debugging"
    });
  },
  startDebug: function() {
    paused = false;

    //console.log(vc);
    //console.log(jscpp["debugger"].setVariable("sensorValues", 42));
    this.setState({
      code: this["debugger"].src,
      vars: [],
      lastVars: []
    });
    return this.debug_stepinto();
  },
  postDebug: function(exitCode) {
    var exitInfo;
    exitInfo = "\nprogram exited with code " + exitCode + ".";
    return this.setState({
      output: this.output + exitInfo
    });
  },
  updateMarkers: function() {
    var lastVars, marker, s, vars;
    s = this["debugger"].nextNode();
    //console.log(s);
    lastVars = this.state.vars;
    vars = this["debugger"].variable();
    //console.log(vars);
    
    if (s.Identifier == "delay") {
    	wantDelay = true;
    	//console.log("delay");
    } else if (s.Identifier == "t" && wantDelay) {
    	wantDelayTime = vars[0].value;
    	//console.log("delay time : " + wantDelayTime);
    }
    
    //marker = new Range(s.sLine - 1, s.sColumn - 1, s.sLine - 1, s.sColumn);
    return this.setState({
      //markers: [marker],
      //markers: [],
      //vars: vars,
      //lastVars: lastVars
    });
  },
  debug_continue: function() {
    return this.debug_stepinto();
  },
  debug_stepinto: function() {
    //var vc = jscpp["debugger"].setVariable("robot");
    //console.log(vc);
    //vc["robot"].v.members.sensorValues.v = pololu3piSensorsResult;

    //var vright = vc["OrangutanMotors"].v.members.vright.v;
    //var vleft = vc["OrangutanMotors"].v.members.vleft.v;

    //console.log("vright =" + vright + " / vleft = " + vleft);
    //var vc2 = jscpp["debugger"].setVariable("OrangutanMotors");
    //console.log(vc2);
    //console.log(vc["OrangutanMotors"]);    

    var done, e;
    try {
      done = this["debugger"]["continue"]();
      if (done !== false) {
        this.debug_stop();
        return this.postDebug(done.v);
      } else {
      	var r = this.updateMarkers();
      	setTimeout(this.debug_continue,wantDelayTime);
  		  wantDelayTime = 0;
        return null;
      }
    } catch (error) {
      e = error;
      //this.handleError(e);
      return this.debug_stop();
    }
  },
  debug_stepover: function() {
    return this.debug_stepinto();
  },
  debug_stepout: function() {
    return this.debug_stepinto();
  },
  debug_stop: function() {
    paused = true;
    this["debugger"] = null;
    return this.setState({
      status: "editing",
      code: this.codeBackup,
      markers: []
    });
  },
  preRun: function() {
    this.setState({
      output: "",
      status: "running"
    });
    return this.timer = new Date().getTime();
  },
  postRun: function(exitCode) {
    paused = true;
    var ellaps, exitInfo;
    if (this.timer) {
      ellaps = new Date().getTime() - this.timer;
      this.timer = null;
      exitInfo = "\nprogram exited with code " + exitCode + " in " + ellaps + "ms.";
      return this.setState({
        output: this.output + exitInfo,
        status: "editing"
      });
    }
  },
  onChangeInput: function(e) {
    return this.setState({
      input: this.refs.input.getValue()
    });
  },
  onChangeOutput: function(e) {
    return this.setState({
      output: this.refs.output.getValue()
    });
  },
  download: function() {
    var event, pom;
    pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.state.code));
    pom.setAttribute('download', 'source.cpp');
    if (document.createEvent != null) {
      event = document.createEvent('MouseEvents');
      event.initEvent('click', true, true);
      return pom.dispatchEvent(event);
    } else {
      return pom.click();
    }
  },
  upload: function() {
    return this.refs.hiddenfile.getDOMNode().click();
  },
  handleFile: function(e) {
    var file, files, fr;
    files = e.target.files;
    if (files.length > 0) {
      file = files.item(0);
      fr = new FileReader();
      fr.onloadend = (function(_this) {
		return function() {
			var result = fr.result;
          result = result.replace(/::/g, ".");
          result = result.replace(/ PROGMEM/g, "");
          result = result.replace(/\\xf7 /g, "pi");
          result = result.replace(/OrangutanLCD.print\(( |[A-Z]|[a-z]|'|[0-9]|"|!)*\);/g, ""); // remove as chamadas de print pois não há overloading implementado
          //result = result.replace(/while\(OrangutanBuzzer::isPlaying\(\)\);/g, "");
          result = result.replace("while(OrangutanBuzzer.isPlaying());", ""); // por algum motivo ele nao entende a construcao while(algo); // tive que remover
          
          //console.log(result);      
      		//fr.result = result;
        
          return _this.setState({
            code: result
          });
        };
      })(this);
      return fr.readAsText(file);
    }
  },
  handleFile2: function(e) {
    var reader = new FileReader();
    trackFilePath = e.target.files[0];
    reader.onload = function(event){
        var timg = new Image();
        timg.onload = function(){
            //canvas.width = img.width;
            //canvas.height = img.height;
            //ctx.drawImage(timg,0,0);
            // background = timg;
            // ctxBackground.drawImage(background,0,0);
            // backgroundData = ctxBackground.getImageData(0, 0, 735, 500);
            
            loadNewTrackFromImage(timg);
        }
        timg.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);     
  },
  filemenu: function(eventKey) {
    switch (eventKey) {
      case "quick-open":
        return this.quickLoad();
      case "quick-save":
        return this.quickSave();
      case "download":
        return this.download();
      case "upload":
        return this.upload();
    }
  },
  render: function() {
    var brand, code, debugging, editing, simulating, input, lastVars, markers, output, ref, running, status, vars;
    ref = this.state, code = ref.code, input = ref.input, output = ref.output, status = ref.status, markers = ref.markers, vars = ref.vars, lastVars = ref.lastVars;
    debugging = status === "debugging";
    editing = status === "editing";
    running = status === "running";
    simulating = status === "simulating";
    brand = React.createElement("a", {
      "href": void 0,
      "className": "logo"
    }, "3D JPi Simulator");
    return React.createElement("div", null, React.createElement("input", {
      "type": "file",
      "ref": "hiddenfile",
      "style": {
        display: "none"
      },
      "onChange": this.handleFile
    }), React.createElement("div", null, React.createElement("input", {
      "type": "file",
      "ref": "hiddenfile2",
      "style": {
        display: "none"
      },
      "onChange": this.handleFile2
    }), React.createElement(Navbar, {
      "brand": brand
    }, React.createElement(Nav, null,
       React.createElement(DropdownButton, {
        "title": "Arquivo",
        "onSelect": this.filemenu
      },
      // React.createElement(MenuItem, {
      //   "eventKey": "quick-open"
      // }, React.createElement(Glyphicon, {
      //   "glyph": "floppy-open"
      // }), "Quick Open (Ctrl + O)"),
      React.createElement(MenuItem, {
        "eventKey": "loadRoad"
      }, React.createElement(Glyphicon, {
        "glyph": "road"
      }), " Pista..."),
      React.createElement(MenuItem, {
        "eventKey": "upload"
      }, React.createElement(Glyphicon, {
        "glyph": "upload"
      }), " Carregar código")//,
      // React.createElement(MenuItem, {
      //   "eventKey": "download"
      // }, React.createElement(Glyphicon, {
      //   "glyph": "save"
      // }), "Download")
      ),
      React.createElement(DropdownButton, {
        "title": "Pistas",
        "onSelect": this.filemenu
        },
        React.createElement(MenuItem, {
          "onClick": this.loadTrack.bind(this,0),
          "disabled": !editing
        }, React.createElement(Glyphicon, {
          "glyph": "road"
        }), " "+ trackOptions[0].name),  
        React.createElement(MenuItem, {
          "onClick": this.loadTrack.bind(this,1),
          "disabled": !editing
        }, React.createElement(Glyphicon, {
          "glyph": "road"
        }), " "+ trackOptions[1].name),  
      ),
    React.createElement(NavItem, {
      "href": "#",
      "onClick": (editing ? this.run.bind(this, true) : void 0),
      "disabled": !editing
    }, React.createElement(Glyphicon, {
      "glyph": "play"
    }), " Run"), (debugging ? React.createElement(NavItem, {
      "href": "#",
      "onClick": (debugging ? this.debug_stop : void 0),
      "disabled": !debugging
    }, React.createElement(Glyphicon, {
      "glyph": "stop"
    }), " Stop") : void 0),
    React.createElement(NavItem, {
      "onClick": (function(){
        x = document.getElementById("helpScreen");
        if(x.style.display === "none"){
          x.style.display = "block";
        } else{
          x.style.display = "none";
        }}),
    }, React.createElement(Glyphicon, {
      "glyph": "question-sign"
    }), " Ajuda")
    )), React.createElement(Grid, null, (debugging ? React.createElement(Row, {
      "className": "debug-toolbar"
    },) : void 0), React.createElement(Row, {
      "className": "main-row"
    }, React.createElement(Col, {
      //"md": (debugging ? 8 : 12)
      "md": (false ? 8 : 12)
    }, React.createElement(AceEditor, {
      "ref": "editor",
      "name": "editor",
      "className": "editor",
      "value": code,
      "onChange": this.onChange,
      "theme": "monokai",
      "readOnly": !editing,
      "markers": markers
    //})), (debugging ? React.createElement(Col, {
    })), (false ? React.createElement(Col, {
      "md": 4
    }, React.createElement(VariablePanel, {
      "mydebugger": this["debugger"],
      "vars": vars,
      "lastVars": lastVars
    })) : void 0)), React.createElement(Row, {
      "className": "io-row"
    }, React.createElement(Col, {
      "md": 6
    }, React.createElement(Input, {
      "ref": "input",
      "className": "input-area",
      "type": "textarea",
      "label": "Standard Input",
      "rows": 5,
      "value": input,
      "onChange": this.onChangeInput
    })), React.createElement(Col, {
      "md": 6
    }, React.createElement(Input, {
      "ref": "output",
      "className": "output-area",
      "type": "textarea",
      "label": "Standard Output",
      "rows": 5,
      "value": output,
      "onChange": this.onChangeOutput
    }))))));
  }
});

var jscpp = React.render(React.createElement(Main, null), document.getElementById("mycontainer"));

// mini3pi = new Image();
// mini3pi.onload = function(){
//   //console.log("imagem do pololu carregada com sucesso!");
//   //drawImageCenter(mini3pi, sim3pi.x, sim3pi.y, sim3pi.rotation);
//   //console.log(mini3pi.width/2 + " " + mini3pi.height/2);

//   //ctx.rect(20,20,30,30);
//   //ctx.stroke();
// };
// mini3pi.src = "assets/mini3pi.png";

// background = new Image();
// var iakImg = document.getElementById('imgBackground');
// background.onload = function(){
//   //console.log("imagem do pololu carregada com sucesso!");
//   //ctx = canvas.getContext("2d");
//   //ctx.drawImage(background, 0, 0);
//   if(canvasBackground == null) {
//     canvasBackground = document.getElementById('canvasBackground');//document.createElement('canvas');
//     // canvasBackground.width = 735;
//     // canvasBackground.height = 500;
//     // canvasBackground.style.width  = 735;
//     // canvasBackground.style.height = 500;
//     ctxBackground = canvasBackground.getContext('2d');
//   }
//   ctxBackground.drawImage(iakImg, 0, 0);
//   backgroundData = ctxBackground.getImageData(0, 0, 735, 500);
//   simulateAndShow();
//   //console.log(imageData);
// };
// background.src = iakImg.src;

function drawImageCenter(image, x, y, rotation){
//    ctx.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
//    ctx.rotate(rotation);
//    ctx.drawImage(image, -cx, -cy);
  //console.log(rotation);

  //console.log(canvas.width + " " + canvas.height + " agora vai");

  var nx = x + 735/2;
  var ny = 500/2 - y;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(background, 0, 0);
  ctx.save();

  ctx.translate(nx-image.width*0.5, ny-image.height * 0.5);
  ctx.translate(image.width * 0.5, image.height * 0.5);
  //ctx.rotate(DegToRad(rotation));
  ctx.rotate(-rotation);
  //ctx.translate(image.width * 0.5, image.height * 0.5);
  ctx.drawImage(image, -image.width*0.5, -image.height*0.5);
  ctx.restore();

  // if(rotation < 90) {
  //    setTimeout(function(){ drawImageCenter(image, x, y, rotation + 1);}, 5);
  // }

}

function readPixel(x, y, rotation) {
  console.log("readPixel");
  //var t = rotation * 3.14/180;
  var t = rotation;
  const robotRadius = robot.radius;
  // var sensorPositions = [[8.04167*Math.cos(t) + 11.8333*Math.sin(t),11.8333*Math.cos(t) - 8.04167*Math.sin(t)],
  // [3.125*Math.cos(t) + 14.0417*Math.sin(t), 14.0417*Math.cos(t) - 3.125*Math.sin(t)],
  // [14.375*Math.sin(t), 14.375*Math.cos(t)],
  // [14.0417*Math.sin(t) - 3.16667*Math.cos(t), 14.0417*Math.cos(t) + 3.16667*Math.sin(t)],
  // //[19.9*Math.sin(t) - 8.04167*Math.cos(t), 19.9*Math.cos(t) + 8.04167*Math.sin(t)]];
  // [11.8333*Math.sin(t) - 8.04167*Math.cos(t), 11.8333*Math.cos(t) + 8.04167*Math.sin(t)]];
  var sensorPositions = Array();
  const sensorAmplitude = Math.PI/3;
  for(var i=0; i<5;i++) {
    var ang = i*sensorAmplitude*0.25 + sensorAmplitude*0.75;
    sensorPositions.push([robotRadius*Math.cos(ang), robotRadis*Math.sin(ang)]);
  }

  var dot = new THREE.Points( dotGeometry, dotMaterial );
  dot.position.x = 0;
  dot.position.y = 0;
  dot.position.z = 30;
  scene.add( dot );

  //var output = "";

  
  // ctx.beginPath();
  // console.log(Math.round(x) + " " + Math.round(y));
  //   ctx.arc(Math.round(x), Math.round(y), 3, 0, 2 * Math.PI, false);
  //   ctx.fillStyle = 'cyan';
  //   ctx.fill();
  //   ctx.lineWidth = 1;
  //   ctx.strokeStyle = '#00FFFF';

  var nx = x + 735/2;
  var ny = 500/2 - y;

  var tempSensor = 0;
  var sum = 0;

  for(var i = 0; i < 5; i++) {
    var tempx = Math.round(sensorPositions[i][0]) + Math.round(nx);
    var tempy = Math.round(sensorPositions[i][1]) + Math.round(ny);
    //output += backgroundData.data[(tempy*735+tempx)*4] + " ";
    
    pololu3piSensors[i] = backgroundData.data[(tempy*735+tempx)*4];
    tempSensor += (pololu3piSensors[i]/255.0)*(i+1)*1000;
    sum += pololu3piSensors[i]/255.0;

    ctx.beginPath();
    ctx.arc(tempx, tempy, 1, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#FF0000';

  }

  tempSensor /= sum;
  //tempSensor /= 5;

  //console.log(tempSensor);

  pololu3piSensorsResult = tempSensor;

  //var imgd = ctxBackground.getImageData(x, y, 1, 1);
  //var pix = imgd.data;
  //console.log(pix[0] + " " + pix[1] + " " + pix[2]);
  //console.log(x + " " + y + " " + (y*735+x)*4);
  //console.log(backgroundData.data[(Math.round(y)*735+Math.round(x))*4]);
  //console.log(backgroundData[(y*735+x)*4]);

}

function DegToRad(d) {
  // Converts degrees to radians
  return d * 0.01745;
}



var ship;

function myMove(e) {
  if (ship.dragging) {
    //console.log(e);
    var rect = canvas.getBoundingClientRect();
    var nx = (e.clientX - rect.left)/rect.width*canvas.width;
    var ny = (e.clientY - rect.top)/rect.height*canvas.height;
    ship.x = nx - 735/2;
    ship.y = 500/2 - ny;

    //draw()
    //drawImageCenter(mini3pi, ship.x, ship.y, ship.rotation);
    //readPixel(ship.x, ship.y, ship.rotation-3.14/2);
  }
}

function getClickedShip(sx,sy){
    if(sx > (sim3pi.x - mini3pi.width/2) && sx < (sim3pi.x+mini3pi.width/2) && sy > (sim3pi.y - mini3pi.height/2) && sy < (sim3pi.y+mini3pi.height/2))
      return sim3pi;
  return null;
}

function myDown(e) {
  var rect = canvas.getBoundingClientRect();
  var nx = (e.clientX - rect.left)/rect.width*canvas.width -735/2;
  var ny = 500/2 - (e.clientY - rect.top)/rect.height*canvas.height;
  ship = getClickedShip(nx, ny);
  //console.log(ship);
  if (ship!=null) {
    ship.x = nx;
    ship.y = ny;
    ship.dragging = true;
    canvas.onmousemove = myMove;
  }
}

function myUp() {
    if (ship!=null) {
      ship.dragging = false;
    }
    canvas.onmousemove = null;
}



var editor = document.getElementById("editor");
editor.style.float = 'right';
editor.style.border = "20px blue";
var editorParent = editor.parentElement;
simulationScreen = document.createElement('div');
simulationScreen.style.width = "50%";
simulationScreen.style.height = "500px";
simulationScreen.id = "simulationScreen";
simulationScreen.style.borderWidth = "2px";
simulationScreen.style.borderColor = "red";

canvas = document.createElement('canvas');
canvas.id = "scene";
//canvas.width = window.innerWidth*0.48;
canvas.width = 735;
canvas.height = 500;
canvas.style.width  = "100%";
canvas.style.height = "500px";
canvas.imageSmoothingEnabled = false;
//canvas.style.zIndex = 8;
//canvas.style.position = "absolute";
canvas.style.float = 'left';
canvas.style.border = "1px solid";
canvas.style.backgroundColor = 'rgba(158, 167, 184, 0.2)';
canvas.onmousedown = myDown;
canvas.onmouseup = myUp;
ctx = canvas.getContext("2d");
// simulationScreen.appendChild(canvas);
editorParent.appendChild(simulationScreen);
