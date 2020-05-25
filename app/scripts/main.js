// on document load
$(document).ready(function(){

	// Call the jQuery Semantic UI plugin like this:
	//	$('#box').semUI({
	//		numberOfRims: 3,
	//		horizontalMargin: 32,
	//		verticalMargin: 64,
	//		nodes: [{ id: 1, name: 'blah' }, {}]
	//	});

	// set outer frame dimensions to the window dimensions minus 32 on each side
	//var $boxWidth = $(window).width() - 64;
	//var $boxHeight = $(window).height() - 128;

	// outer box width and height
	var $boxWidth;
	var $boxHeight;

	//		--- GLOBAL VARIABLES ---
    var $regionBG;
    var $centralNodeBar;

	// number of rims to start with
	// var $numberOfRims = 3;
	// margin on each side of the box
	var $horizontalMargin = 32;
	var $verticalMargin = 64;
	// skinny rim size
	var $smallestRimWidth = 128;
	var $smallestRimHeight = 64;
	var $iconRimHeight = 32;
	
	/* 
		things to add to debug panel:
		
		number of rims: 		- # +
		rim # mode: 			[drop down box]
		rim # color: 			[text box]
		enable region background:	[checkbox]
		enable region labels:		[checkbox]

	*/


	// node constructor, creates a node with an ID, text body, and semantic shape  #
	// shape #s are similar to region #s: 0 = facts, 1 = merits, 2 = people, 3 = thoughts, 4 = ?, 5 = actions, 6 = feelings, 7 = needs, 8 = topics
	// rim 0 is the outer rim

	/* modes are:
	b = balanced		equal region sizes
	c = center 		fixed smallest corner regions, center regions stretched to fill
	
	modes to be made still:
	cw = center wide 	fixed smallest(2x wide) corner regions, center regions stretched to fill
		
	n, nw... = direction weighted 1/3rd
	*/

	// an array of regions, with each regions' dimensions and mode
	// E.G. $regionArray[1][3] would be region on the 1st outermost rim and the 3rd quadrant right-down
	
	// TODO: Make an object for each rim
	function Rim(author, color, mode){
		return {
			author : author,
			color : color,
			mode : mode
		}
	}

	// make an array of rim objects
	var $rimArray = [];

	// make 3 example rims 
	$rimArray.push(Rim('me', '#FFDD89', 'c'));
	$rimArray.push(Rim('bibbelo', '#CA6DAC', 'c'));
	$rimArray.push(Rim('everyone', '#63B795', 'b'));


	// make the rims initial rims
	// for each rim
	for(var i = 0; i < $rimArray.length; i++){
		$rimArray[i].width = 0;
		$rimArray[i].height = 0;
		$rimArray[i].hOffset;
		$rimArray[i].vOffset;
		// create arrays in each rim's dimensions and coords
		$rimArray[i].w = new Array();
		$rimArray[i].h = new Array();
		$rimArray[i].x = new Array();
		$rimArray[i].y = new Array();
		// create an array for the actual div itself
		$rimArray[i].region = new Array();

		// alternate checkering regions
		var $checkeredRegion = true;
		// for each region in the rim
		for(var j = 0; j < 9; j++){
			// create the HTML elements with the name "region(rimNum)(regionNum)
			// region numbers are 0-8
			// 0 = nw, 1 = n, 2 = ne, 3 = w, 4 = c, 5 = e, 6 = sw, 7 = s, 8 = se
			// E.G.:	region25 = east region on the 2nd outermost rim 
			$rimArray[i].region[j] = document.createElement('div');
			$rimArray[i].region[j].id = 'region' + i.toString() + j.toString();
			$rimArray[i].region[j].className = 'region';
			document.getElementById('box').appendChild($rimArray[i].region[j]);
			$rimArray[i].w[j] = 0;
			$rimArray[i].h[j] = 0;
			$rimArray[i].x[j] = 0;
			$rimArray[i].y[j] = 0;
			// if this region is to be checkered, make it darker and toggle it
			if ($checkeredRegion == true){
				document.getElementById('region' + i.toString() + j.toString()).style.filter = 'brightness(90%)';
				$checkeredRegion = false;
			// otherwise just toggle it
			} else {
				$checkeredRegion = true;
			}
			// event listeners
			//document.getElementById('region' + i.toString() + j.toString()).addEventListener('mouseover', moveTextArea(i,j));
		}
		document.getElementById('region' + i.toString() + '4').style.textAlign = 'center';
	}

	


	var $sizeCount;
	// set the sizes
	function setSizes(){
		// set the box width and height to the window width and height minus the margin
		//$boxHeight = $(window).height() - $verticalMargin*2;
		$boxHeight = 600;
		$boxWidth = $(window).width() - $horizontalMargin*2;
		// sets the outer rim, current working width and height is the box width and height and round it down to be divisible by 3
		$rimArray[0].width = $boxWidth - $boxWidth % 3;
		$rimArray[0].height = $boxHeight - $boxHeight % 3;;

		$rimArray[0].hOffset = $horizontalMargin;
		$rimArray[0].vOffset = $verticalMargin;	
		$('#box').css('width', $rimArray[0].width);
		$('#box').css('height', $rimArray[0].height);
		$sizeCount = $boxHeight;

		/*
		// variables for embedding rims inside one another
		// width and height for the next rim, starting on the outside and going in
		// offset from edge of page for next rim, including hori and vert margin
		*/

		// do this for each rim
		for(i = 0; i < $rimArray.length; i++){
			// if it's not the outer rim
			if (i > 0) {
				// set the width and height to the center region (#4) width and height of the rim outside it (embed it inside)
				$rimArray[i].width = $rimArray[i-1].w[4];	
				$rimArray[i].height = $rimArray[i-1].h[4];	
				// set the offsets
				// set the left offset to the parent rim's leftmost region(#3)'s right edge
				$rimArray[i].hOffset = $rimArray[i-1].x[3] + $rimArray[i-1].w[3];	
				// set the top offset to the parent rim's topmost region(#1)'s bottom edge
				$rimArray[i].vOffset = $rimArray[i-1].y[1] + $rimArray[i-1].h[1];	
			}

			// the 'balanced' mode width and height for this region
			var $balancedRegionWidth = $rimArray[i].width / 3;
			var $balancedRegionHeight = $rimArray[i].height / 3;
			// if the rim is set to balanced mode
			if ($rimArray[i].mode == 'b'){
				// for each of the 9 regions
				for(var j = 0; j < 9; j++){
					//set the regions dimensions to the proportionally weighted width and height
					$rimArray[i].w[j] = $balancedRegionWidth;
					$rimArray[i].h[j] = $balancedRegionHeight;

					// set region X coordinates
					switch (j) {
						// any of the leftmost regions 
						case 0: 
						case 3: 
						case 6: 
							// set the region's x coord to the the rims x coord plus position offset
							$rimArray[i].x[j] = $rimArray[i].hOffset;
							break;
						// any of the middle column regions 
						case 1: 
						case 4: 
						case 7: 
							$rimArray[i].x[j] = $rimArray[i].hOffset + $balancedRegionWidth;
							break;
						// any of the rightmost regions 
						case 2: 
						case 5: 
						case 8: 
							$rimArray[i].x[j] = $rimArray[i].hOffset + $balancedRegionWidth * 2;
							break;
					}
					// set region y coordinates
					switch (j) {
						// any of the topmost regions 
						case 0: 
						case 1: 
						case 2: 
							$rimArray[i].y[j] = $rimArray[i].vOffset;
							break;
						// any of the middle row regions 
						case 3: 
						case 4: 
						case 5: 
							$rimArray[i].y[j] = $rimArray[i].vOffset + $balancedRegionHeight;
							break;
						// any of the bottommost regions 
						case 6: 
						case 7: 
						case 8: 
							$rimArray[i].y[j] = $rimArray[i].vOffset + $balancedRegionHeight * 2;
							break;
					}
					// apply the CSS change
					$('#region' + i.toString() + j.toString()).css('width', $rimArray[i].w[j]);
					$('#region' + i.toString() + j.toString()).css('height', $rimArray[i].h[j]);
					$('#region' + i.toString() + j.toString()).css('left', $rimArray[i].x[j]);
					$('#region' + i.toString() + j.toString()).css('top', $rimArray[i].y[j]);
					//give the region a background div
					$regionBG = document.createElement('div');
					$regionBG.id = 'regionBG' + i.toString(); 
					$regionBG.style.width = '100%'; 
					$regionBG.style.height = '100%'; 
					$regionBG.style.backgroundColor = $rimArray[i].color;
					//document.getElementById('region' + i.toString() + j.toString()).appendChild($regionBG);
					$('#region' + i.toString() + j.toString()).css('background-color', $rimArray[i].color);
				}


			// if the rim is set to center mode 
			} else if ($rimArray[i].mode == 'c' || $rimArray[i].mode == 'cw'){
				var $currentRimWidth;
				var $currentRimHeight;

				if ($rimArray[i].mode == 'c'){
					$currentRimWidth = 32;
					$currentRimHeight = 32;
				}

				if ($rimArray[i].mode == 'cw'){
					$currentRimWidth = $smallestRimWidth;
					$currentRimHeight = $smallestRimHeight;
				}

				// for each of the 9 regions
				for(var j = 0; j < 9; j++){
					//set the regions dimensions to the center weighted width and height
					// set the leftmost and rightmost regions width to 32 pixels each
					$rimArray[i].w[0] = $currentRimWidth;
					$rimArray[i].w[2] = $currentRimWidth;
					$rimArray[i].w[3] = $currentRimWidth;
					$rimArray[i].w[5] = $currentRimWidth;
					$rimArray[i].w[6] = $currentRimWidth;
					$rimArray[i].w[8] = $currentRimWidth;
					// set the center column of regions to the remaining width
					$rimArray[i].w[1] = $rimArray[i].width - $currentRimWidth * 2;
					$rimArray[i].w[4] = $rimArray[i].width - $currentRimWidth * 2;
					$rimArray[i].w[7] = $rimArray[i].width - $currentRimWidth * 2;

					// set the topmost and bottommost regions height to 32 pixels each
					$rimArray[i].h[0] = $currentRimHeight;
					$rimArray[i].h[1] = $currentRimHeight;
					$rimArray[i].h[2] = $currentRimHeight;
					$rimArray[i].h[6] = $currentRimHeight;
					$rimArray[i].h[7] = $currentRimHeight;
					$rimArray[i].h[8] = $currentRimHeight;
					// set the center column of regions to the remaining width
					$rimArray[i].h[3] = $rimArray[i].height - $currentRimHeight * 2;
					$rimArray[i].h[4] = $rimArray[i].height - $currentRimHeight * 2;
					$rimArray[i].h[5] = $rimArray[i].height - $currentRimHeight * 2;

					// set region X coordinates
					switch (j) {
						// any of the leftmost regions 
						case 0: 
						case 3: 
						case 6: 
							// set the region's x coord to the the rims x coord plus position offset
							$rimArray[i].x[j] = $rimArray[i].hOffset;
							break;
						// any of the middle column regions 
						case 1: 
						case 4: 
						case 7: 
							$rimArray[i].x[j] = $rimArray[i].hOffset + $currentRimWidth;
							break;
						// any of the rightmost regions 
						case 2: 
						case 5: 
						case 8: 
							// set the x coord to offset + middle rim width + 32 from leftmost rim
							$rimArray[i].x[j] = $rimArray[i].hOffset + $rimArray[i].w[4] + $currentRimWidth;
							break;
					}
					// set region y coordinates
					switch (j) {
						// any of the topmost regions 
						case 0: 
						case 1: 
						case 2: 
							$rimArray[i].y[j] = $rimArray[i].vOffset;
							break;
						// any of the middle row regions 
						case 3: 
						case 4: 
						case 5: 
							$rimArray[i].y[j] = $rimArray[i].vOffset + $currentRimHeight;
							break;
						// any of the bottommost regions 
						case 6: 
						case 7: 
						case 8: 
							$rimArray[i].y[j] = $rimArray[i].vOffset + $rimArray[i].h[4] + $currentRimHeight;
							break;
					}
					// apply the CSS change
					$('#region' + i.toString() + j.toString()).css('width', $rimArray[i].w[j]);
					$('#region' + i.toString() + j.toString()).css('height', $rimArray[i].h[j]);
					$('#region' + i.toString() + j.toString()).css('left', $rimArray[i].x[j]);
					$('#region' + i.toString() + j.toString()).css('top', $rimArray[i].y[j]);
					//give the region a background div
					$regionBG = document.createElement('div');
					$regionBG.id = 'regionBG' + i.toString(); 
					$regionBG.style.width = '100%'; 
					$regionBG.style.height = '100%'; 
					//$regionBG.style.display = 'none'; 
					$regionBG.style.backgroundColor = $rimArray[i].color;
					//document.getElementById('region' + i.toString() + j.toString()).appendChild($regionBG);
					$('#region' + i.toString() + j.toString()).css('background-color', $rimArray[i].color);
				}
			}


			// TO DO: CHECK THAT WIDTH AND HEIGHT ADD UP, PRINT ERROR IF NOT
			// set the css width and height to actually resize the region
			

		}
	}

	// set initial sizes		

	setSizes();
	// each time the window is resized

	// currently focused node ID
	var $focusedNode;

	function focusNode(ID){
		$focusedNode = ID;
	}
	focusNode(0);
	
	// node constructor
	function Node(ID, parentID, shape, text){
		return {
			ID : ID,
			parentID : parentID,
			shape : shape,
			text : text
		}
	}
	// an array of the nodes
	var $nodeArray = [];
	// make the root node
	$nodeArray.push(Node(0, -1, 8, 'Fruit'));
	// give it an array of its children's IDs
	$nodeArray[0].children = new Array();

	// total count of all nodes
	var $numberOfNodes = 1;
	// function to add a new node to an existing node
	function addNode(parentID, shape, text){
		// make the node
		$nodeArray.push(Node($numberOfNodes, parentID, shape, text));
		// tell its parent
		$nodeArray[parentID].children.push($numberOfNodes);
		// give it an array of its children's IDs
		$nodeArray[$numberOfNodes].children = new Array();
		$numberOfNodes++;
	}
	// 	sub-opinions	
	addNode(0, 3, 'Fruit is good for you');
	addNode(1, 3, 'Fruit is bad for you');
	// 	sub-actions	
	addNode(0, 5, 'Eat');
	addNode(0, 5, 'Give');
	addNode(0, 5, 'Plant');
	addNode(0, 5, 'Example');
	addNode(0, 5, 'Preserve');
	addNode(0, 5, 'Squash');
	addNode(0, 5, 'Example');
	addNode(0, 5, 'Example');
	addNode(0, 5, 'Example');
	addNode(0, 5, 'Ferment');
	addNode(0, 5, 'Cook');
	addNode(0, 5, 'Example');
	addNode(0, 5, 'Example');
	addNode(0, 5, 'Example');
	addNode(0, 5, 'Example');
	addNode(0, 5, 'Refine');
	//	sub-topics
	addNode(0, 8, 'Food');
	
	
	var $innerRim = $rimArray.length - 1;


	// node bars are the divs that make up the body of the node, what's clickable 
	// E.G.: 	$nodeBarArray[0].region[4].number[0]
	// 		is the node bar on the innermost rim, in the center region, and it's the first node on the list 
	// E.G. 2: 	$nodeBarArray[1].region[2].number[2]
	// 		is the node bar on the rim outside of the innermost rim, in the people region, and it's the third (2 nodes before it) node on the list 
	var $nodeBarArray = [];
	
	// the central node bar is bigger
	$centralNodeBar = document.createElement('div');
	$centralNodeBar.id = 'centralNodeBar';
	// append the central node bar div to the center region
	document.getElementById( 'region' + $innerRim.toString() + '4' ).appendChild($centralNodeBar);

	function makeNodeBars(){
		// remove all the current nodebars
		$('div.nodeBar').remove();
		// for every child of the root node, make another one
		
		if (!($nodeArray[$focusedNode].children === undefined )){
			for (var i = 0; i < $nodeArray[$focusedNode].children.length; i++){
				// node bar region is the focused node's child's region 
				var $nodeBarRegion = $nodeArray[$nodeArray[$focusedNode].children[i]].shape;

				// make the new node bar
				$nodeBarArray[i] = document.createElement('div');
				// put the node bars in the appropriate regions, 1 rim outwards and the region the node is tagged with
				document.getElementById( 'region' + '2' + $nodeBarRegion.toString()).appendChild($nodeBarArray[i]);
				// give the node a CSS id and class
				$nodeBarArray[i].id = 'nodeBar' + i.toString();
				$nodeBarArray[i].className = 'nodeBar';
				// put the content in the node bars
				document.getElementById('nodeBar' + i.toString()).innerHTML = $nodeArray[$nodeArray[$focusedNode].children[i]].text;
				// if the nodebar is clicked
				$('#nodeBar' + i.toString()).click(function() {
					focusNode($nodeArray[$focusedNode].children[i]);
					makeNodeBars();
				});
			}
		}
		// display the focused node's text in the center region (#4) on the innermost rim
		document.getElementById( 'centralNodeBar' ).innerHTML = '<br>' + $nodeArray[$focusedNode].text;
	}
	makeNodeBars();

	var $textArea = document.createElement('textarea');
	$textArea.id = 'inputText';
	$textArea.placeholder = 'Click here to type a response...';
	$textArea.style.width = '100%';
	$textArea.style.height = '100%';
	function moveTextArea(rim, region){
		if (rim == 2){
			document.getElementById('region' + rim.toString() + region.toString()).appendChild($textArea);
		}
	}

	// listen for hovering on the innermost rim
	$('#region' + '20' ).bind('mouseenter', function() {
		moveTextArea(2,0);
	});
	$('#region' + '21' ).bind('mouseenter', function() {
		moveTextArea(2,1);
	});


				
	
	var debug = {
		print : function() {
			document.getElementById('debug').innerHTML = $debugval1;	

			}
	};

    	$(window).resize(function() {
		setSizes();		
	});	

		
});
