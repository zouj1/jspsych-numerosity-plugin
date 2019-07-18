jsPsych.plugins["numerosity-task"] = (function() {
	var plugin = {};
	plugin.info = {
	    name: "numerosity-task",
	    parameters: {
				choices: {
	        type: jsPsych.plugins.parameterType.KEYCODE,
	        array: true,
	        pretty_name: 'choices',
	        default: [81, 80], // p and q for left and right, respectively
	        description: '[key to choose the left option, key to choose the right option]'
	      },
				trial_duration: {
		      type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Trial duration",
		      default: 1000,
		      description: "The length of stimulus (two assortments of circles) presentation"
		    },
		    mean1: {
		      type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Distribution 1's Mean",
		      default: 65,
		      description: "The mean number of circles for distribution 1. The number of circles for one of the arrays will be defined by this distribution."
		    },
				sd1:{
					type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Distribution 1's Standard Deviation",
		      default: 10,
		      description: "Standard Deviation of circles in distribution 1"
				},
				mean2: {
		      type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Distribution 2's Mean",
		      default: 65,
		      description: "The mean number of circles for distribution 2. The number of circles for one of the arrays will be defined by this distribution."
		    },
				sd2:{
					type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "Distribution 2's Standard Deviation",
		      default: 10,
		      description: "Standard Deviation of circles in distribution 2"
				},
				radius:{
					type: jsPsych.plugins.parameterType.INT,
		      pretty_name: "radius of circles",
		      default: 10,
		      description: "radius of circles"
				},
		    background_color: {
		      type: jsPsych.plugins.parameterType.STRING,
		      pretty_name: "Background color",
		      default: "white",
		      description: "The color of the 'canvas' that the stimuli will be drawn on"
	    	},
				circle_color: {
		      type: jsPsych.plugins.parameterType.STRING,
		      pretty_name: "Color of Circles",
		      default: "blue",
		      description: "Color of the circles"
		    },
				border_color: {
					type: jsPsych.plugins.parameterType.STRING,
					pretty_name: "Color of border",
					default: "black",
					description: "Color of the rectangular border that separates the two arrays"
				},
				circle_width: {
					type: jsPsych.plugins.parameterType.INT,
					pretty_name: "Width of Circles",
					default: 5,
					description: "The 'thickness' that the circles are drawn"
				},
				border_width: {
					type: jsPsych.plugins.parameterType.INT,
					pretty_name: "width of border",
					default: 2,
					description: "The 'thickness' that the rectangular borders are drawn"
				}
	 }
}

	//BEGINNING OF TRIAL
	plugin.trial = function(display_element, trial) {

		// Assign unassigned parameters to their default
		function assignParameterValue(argument, defaultValue){
			return typeof argument !== 'undefined' ? argument : defaultValue;
		}

		trial.choices = assignParameterValue(trial.choices, [80, 81]);
		trial.trial_duration = assignParameterValue(trial.trial_duration, 1000);
		trial.mean1= assignParameterValue(trial.mean1, 65);
		trial.sd1 = assignParameterValue(trial.sd1, 10);
		trial.mean2= assignParameterValue(trial.mean2, 65);
		trial.sd2 = assignParameterValue(trial.sd2, 10);
		trial.radius = assignParameterValue(trial.radius, 10);
		trial.background_color = assignParameterValue(trial.background_color, "white");
		trial.circle_color = assignParameterValue(trial.circle_color, "blue");
		trial.border_color = assignParameterValue(trial.border_color, "black");
		trial.circle_width = assignParameterValue(trial.circle_width, 5);
		trial.border_width = assignParameterValue(trial.border_width, 2);

		// Set Default values for subject response
		// -1 is used if the trial times out and the subject has not pressed a valid key
		var response = {
			rt: -1,
			key: -1
		}

		// START MAKING STIMULI (ie canvas)
		// Edit the body, currently described by <body class="jspsych-display-element"> .... </body>
		var body = document.getElementsByClassName("jspsych-display-element")[0];
		var originalMargin = body.style.margin;
		var originalPadding = body.style.padding;
		var originalBackgroundColor = body.style.backgroundColor;

		body.style.margin = 0;
	  body.style.padding = 0;
		body.style.backgroundColor = trial.background_color;

		//Create a canvas element and append it to the DOM
		var canvas = document.createElement("canvas");
		display_element.appendChild(canvas);

		//Remove the margins and padding of the canvas
		canvas.style.margin = 0;
		canvas.style.padding = 0;

		//Get the context of the canvas so that it can be painted on.
		var ctx = canvas.getContext("2d");
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;


		// DETERMINE SPECIFIC FEATURES OF STIMULI
		var circles_1; // draw a number from a normal distribution 1 for one array
		var circles_2; // draw a number from a normal distribution 2 for one array

		// Function to draw the number of circles to put in an array froma normal distribution with mean m and standard deviation sd
		function nrand(m,sd){
				if (sd == 0) {
						return m;
				} else {
				var x1, x2, rad, y1;
				do {
						x1 = 2 * Math.random() - 1;
						x2 = 2 * Math.random() - 1;
						rad = x1 * x1 + x2 * x2;
				} while(rad >= 1 || rad == 0);

				var c = Math.sqrt(-2 * Math.log(rad) / rad);
				var y = Math.round((x1 * c * (sd^2))+m);
				return y;
				}
		};

		// ensure that the number of circles in the arrays are different
		while (circles_1 === circles_2){
			var circles_1 = nrand(trial.mean1, trial.sd1)
			var circles_2 = nrand(trial.mean2, trial.sd2)
		}

		var difference = circles_1 - circles_2
		if (difference > 0){
			larger_magnitude = 'distribution1'
		}
		else{
			larger_magnitude = 'distribution2'
		}

		// randomly decide which array of circles should be on the left, and which on the right
		if (Math.round(Math.random()) === 0){
			left_circles = circles_1
			right_circles = circles_2
			left_1 = true // the array with number of circles determined by distribution 1, will be on the left
		} else {
			left_circles = circles_2
			right_circles = circles_1
			left_1 = false
		}

		// Determining the size of the stimuli given the browser/screen/etc that the subject is using
		var rect_width = 1/3*window.innerWidth
		var rect_height = 1/2*window.innerHeight

		var left_x = 1/9*window.innerWidth
		var left_y = 1/4*window.innerHeight

		var right_x = 5/9*window.innerWidth
		var right_y = 1/4*window.innerHeight

		generate_circles()
		jsPsych.pluginAPI.setTimeout(function() {
			end_trial();
		}, trial.trial_duration);

		// Draw the arrays of circles on the canvas
		function generate_circles(){
			var timerHasStarted = false; // reset the timer, don't start until after the circles are done being generated
			ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); // ensure no past canvas features are remaining

			// Draw the rectangles that the circles will be
			ctx.strokeStyle = trial.border_color;
			ctx.lineWidth = trial.border_width;
			ctx.rect(left_x, left_y, rect_width, rect_height);
			ctx.rect(right_x, right_y, rect_width, rect_height);
			ctx.stroke();

			var padding = trial.radius + trial.circle_width + trial.border_width // prevent the circles from going past the rectangular border

			// determine the boundaries from which circle centers can be chosen from for both left and right arrays
			var left_x_max = left_x + rect_width - padding
			var left_y_max = left_y + rect_height - padding
			var right_x_max = right_x + rect_width - padding
			var right_y_max = right_y + rect_height - padding

			// Draw the circles
			for(var i=0; i < left_circles; i++){
			var x_coord = Math.random() * (left_x_max - left_x - padding) + left_x + padding
			var y_coord = Math.random() * (left_y_max - left_y - padding) + left_y + padding

				 ctx.strokeStyle = trial.circle_color;
			   ctx.lineWidth = trial.circle_width;
				 ctx.beginPath();
			   ctx.arc(x_coord, y_coord, trial.radius, 0 ,2*Math.PI);
			 	 ctx.stroke();
			}

			for(var i=0; i < right_circles; i++){
			var x_coord = Math.random() * (right_x_max - right_x - padding) + right_x + padding
			var y_coord = Math.random() * (right_y_max - right_y - padding) + right_y + padding

				 ctx.strokeStyle = trial.circle_color;
			   ctx.lineWidth = trial.circle_width;
				 ctx.beginPath();
			   ctx.arc(x_coord, y_coord, trial.radius, 0 ,2*Math.PI);
			 	 ctx.stroke();
			}
			startKeyboardListener();
		}

		// Determines what counts as a keyboard response, and how that response took
		function startKeyboardListener(){
			if (trial.choices != jsPsych.NO_KEYS) {
				//Create the keyboard listener to listen for subjects' key response
				keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
					callback_function: after_response, // Function to call once the subject presses a valid key
					valid_responses: trial.choices,
					rt_method: 'performance', // method to get rt
					persist: false, // false: keyboard listener will only trigger the first time a valid key is pressed. true: it has to be explicitly cancelled by the cancelKeyboardResponse plugin API.
					allow_held_key: false // false: Only register the key once, after this getKeyboardResponse function is called. (Check JsPsych docs for better info under 'jsPsych.pluginAPI.getKeyboardResponse').
				});
			}
		}

		//Function to record the first response by the subject
		function after_response(info) {
			//If the response has not been recorded, record it
			if (response.key == -1) {
				response = info; //Replace the response object created above
			}
			end_trial();

		}

		//Function to end the trial properly
		function end_trial() {
			jsPsych.pluginAPI.clearAllTimeouts();
			//Kill the keyboard listener if keyboardListener has been defined
			if (typeof keyboardListener !== 'undefined') {
				jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
			}

			//Place all the data to be saved from this trial in one data object
			var trial_data = {
				"rt": response.rt, //The response time
				"key_press": response.key, //The key that the subject pressed
				"distr_1_mean": trial.mean1,
				"distr_2_mean": trial.mean2,
				"distr_1_sd": trial.sd1,
				"distr_2_sd": trial.sd2,
				'num_circles_from_distr_1': circles_1,
				'num_circles_from_distr_2': circles_2,
				'difference_in_magnitude': difference,
				'larger_magnitude': larger_magnitude,
			}

			if (left_1 === true){ // the array on the left was drawn from distribtion 1
				trial_data['left_distribution'] = 'distribution1'
				trial_data['right_distribution'] = 'distribution2'
			} else { // the array on the left was drawn from distribtion 2
				trial_data['left_distribution'] = 'distribution2'
				trial_data['right_distribution'] = 'distribution1'
			}

			// Determine whether the subject chose the correct answer
			if (response.key == trial.choices.slice(0,1)){ // subject chose left
				if (larger_magnitude === trial_data['left_distribution']){
					trial_data.correct = true
				}
				else {
					trial_data.correct = false
				}
			} else if (response.key == trial.choices.slice(1,2)){ // subject chose right
				if (larger_magnitude === trial_data['right_distribution']){
					trial_data.correct = true
				}
				else {
					trial_data.correct = false
				}
			} else { // subject chose an invalid key
				trial_data.correct = null
			}

			//Remove the canvas as the child of the display_element element
			display_element.innerHTML='';

			//Restore the settings to JsPsych defaults
			body.style.margin = originalMargin;
			body.style.padding = originalPadding;
			body.style.backgroundColor = originalBackgroundColor

			jsPsych.finishTrial(trial_data); //End this trial and move on to the next trial

		} //End of end_trial function

	};
	return plugin; //Return the plugin object which contains the trial
})();
