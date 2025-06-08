export const configsByEmotion = {
	anger: {
		colorPalette: [
			[204, 28, 23],
			[208, 46, 53],
			[212, 65, 63],
			[216, 83, 73],
			[220, 102, 83],
			[224, 120, 92],
			[228, 135, 102],
		],
	},
	disgust: {
		colorPalette: [
			[0, 104, 55],
			[0, 110, 57],
			[0, 116, 59],
			[0, 122, 61],
			[0, 128, 63],
			[0, 130, 65],
			[0, 136, 67],
			[0, 142, 69],
		],
	},
	enjoyment: {
		colorPalette: [
			[248, 136, 29],
			[243, 143, 30],
			[243, 136, 33],
			[244, 149, 36],
			[244, 153, 40],
			[245, 156, 43],
			[245, 159, 46],
			[246, 162, 49],
			[247, 169, 56],
			[246, 166, 53],
			[247, 172, 59],
		],
	},
	fear: {
		colorPalette: [
			[143, 39, 139],
			[156, 41, 153],
			[196, 49, 194],
			[209, 51, 207],
			[223, 53, 221],
			[235, 56, 234],
			[248, 58, 248],
		],
	},
	sadness: {
		colorPalette: [
			[65, 74, 161],
			[54, 104, 178],
			[49, 124, 189],
			[44, 139, 200],
			[51, 158, 211],
			[85, 172, 217],
			[146, 198, 229],
			[174, 209, 234],
			[195, 218, 238],
		],
	},
};

export const eventsAndResponses = {
	enjoyment: [
		{
			event: "Get a promotion",
			response: "Jump for joy",
			severity: "medium",
		},
		{
			event: "Win the lottery",
			response: "Do a happy dance",
			severity: "high",
		},
		{
			event: "Get a surprise gift",
			response: "Blush",
			severity: "medium",
		},
		{
			event: "Hear a joke",
			response: "Laugh out loud",
			severity: "low",
		},
		{
			event: "Finish a marathon",
			response: "Smile from ear to ear",
			severity: "high",
		},
		{
			event: "Achieve a goal",
			response: "Give a thumbs up",
			severity: "medium",
		},
		{
			event: "Successfull interview",
			response: "High five someone",
			severity: "medium",
		},
		{
			event: "Receive good news",
			response: "Hug someone tight",
			severity: "medium",
		},
		{
			event: "Enjoy a vacation",
			response: "Savor",
			severity: "medium",
		},
		{
			event: "Fall in love",
			response: "Take a deep breath",
			severity: "high",
		},
		{
			event: "Help a stranger",
			response: "Treat yourself",
			severity: "medium",
		},
	],
	anger: [
		{
			event: "Stuck in traffic",
			response: "Bang your head",
			severity: "medium",
		},
		{
			event: "Lose a phone charger",
			response: "Grind your teeth",
			severity: "low",
		},
		{
			event: "Slow internet speed",
			response: "Curse quietly",
			severity: "low",
		},
		{
			event: "Spill coffee on shirt",
			response: "Simmer",
			severity: "low",
		},
		{
			event: "Missed flight",
			response: "Clench your fists",
			severity: "medium",
		},
		{
			event: "Loud construction noise",
			response: "Slam the door",
			severity: "low",
		},
		{
			event: "Computer data loss",
			response: "Cry in frustration",
			severity: "medium",
		},
		{
			event: "Called a racist slur",
			response: "Prepare to fight",
			severity: "high",
		},
		{
			event: "Forget phone password",
			response: "Walk away angry",
			severity: "medium",
		},
		{
			event: "Misdiagnosed at hospital",
			response: "Yell at somone",
			severity: "high",
		},
		{
			event: "Delivery delayed",
			response: "Roll your eyes",
			severity: "low",
		},
		{
			event: "Telemarketer calls",
			response: "Be passive-agressive",
			severity: "low",
		},
		{
			event: "Identity stolen",
			response: "Scream in anger",
			severity: "high",
		},
	],
	disgust: [
		{
			event: "Discover moldy food",
			response: "Cover your nose",
			severity: "medium",
		},
		{
			event: "Drain is clogged",
			response: "Wash your hands",
			severity: "low",
		},
		{
			event: "Toilet overflowing",
			response: "Look away quickly",
			severity: "high",
		},
		{
			event: "Foul smell",
			response: "Gag uncontrollably",
			severity: "medium",
		},
		{
			event: "Touched inappropriately",
			response: "Shudder",
			severity: "high",
		},
		{
			event: "Discover bedbugs",
			response: "Recoil",
			severity: "high",
		},
		{
			event: "Taste spoiled milk",
			response: "Throw up in disgust",
			severity: "high",
		},
		{
			event: "Bugs in kitchen",
			response: "Hold your breath",
			severity: "medium",
		},
		{
			event: "Dirty dishes everywhere",
			response: "Shudder in disgust",
			severity: "low",
		},
		{
			event: "Wet garbage juice",
			response: "Plug your nose",
			severity: "medium",
		},
		{
			event: "Moldy shower grout",
			response: "Scrub and rinse",
			severity: "low",
		},
		{
			event: "Unclean bathroom surfaces",
			response: "Step away quickly",
			severity: "medium",
		},
	],
	sadness: [
		{
			event: "Alone on holidays",
			response: "Cry yourself to sleep",
			severity: "medium",
		},
		{
			event: "Goodbyes at airport",
			response: "Stay in bed all day",
			severity: "medium",
		},
		{
			event: "Receive bad news",
			response: "Talk to a friend",
			severity: "medium",
		},
		{
			event: "Lose a loved one",
			response: "Take a long bath",
			severity: "high",
		},
		{
			event: "Relationship falls apart",
			response: "Listen to sad music",
			severity: "high",
		},
		{
			event: "Dreams not achieved",
			response: "Write in a journal",
			severity: "high",
		},
		{
			event: "Houseplant wilts",
			response: "Water it",
			severity: "low",
		},
		{
			event: "Rejected from job",
			response: "Take a deep breath",
			severity: "medium",
		},
		{
			event: "Broken heart again",
			response: "Take a long walk",
			severity: "medium",
		},
		{
			event: "Repeatedly misunderstood",
			response: "Watch a sad movie",
			severity: "medium",
		},
		{
			event: "Break a nail",
			response: "Pout",
			severity: "low",
		},
	],
	fear: [
		{
			event: "Hear a strange noise",
			response: "Freeze momentarily",
			severity: "low",
		},
		{
			event: "Approached by a stranger",
			response: "Take a step back",
			severity: "low",
		},
		{
			event: "Stuck in an elevator",
			response: "Scream for help",
			severity: "medium",
		},
		{
			event: "Witness a car accident",
			response: "Cower in fear",
			severity: "high",
		},
		{
			event: "Feel someone watching",
			response: "Shiver",
			severity: "medium",
		},
		{
			event: "Get lost in a forest",
			response: "Panic and run",
			severity: "high",
		},
		{
			event: "Break-in at home",
			response: "Hide and stay quiet",
			severity: "high",
		},
		{
			event: "Health scare news",
			response: "Become hyper-vigilant",
			severity: "medium",
		},
		{
			event: "Plane turbulence",
			response: "Hold your breath",
			severity: "medium",
		},
		{
			event: "Natural disaster",
			response: "Duck for cover",
			severity: "high",
		},
	],
};

/**
 * Retrieves an array of emotion keys (e.g., "anger", "fear", etc.)
 * from the eventsAndResponses object.
 */
export const emotions = Object.keys(eventsAndResponses);

/**
 * Class names for shared styles across the Waking Up section.
 */
export const sharedStyle = {
	pageContainer: "waking-up__pageContainer",
	stars: "waking-up__stars",
	emotionContainer: "waking-up__emotionContainer",
	emotionColorField: "waking-up__emotionColorField",
	immersiveScrollContainer: "waking-up__immersiveScrollContainer",
	triggerQuestion: "waking-up__triggerQuestion",
	triggerArrow: "waking-up__triggerArrow",
	responseQuestion: "waking-up__responseQuestion",
	responseArrow: "waking-up__responseArrow",
	sectionHeading: "waking-up__sectionHeading",
};
