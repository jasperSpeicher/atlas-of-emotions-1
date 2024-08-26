import d3 from "d3";
import { TweenMax, TimelineMax, gsap } from "gsap";

import Episode from "./Episode.js";
import Continent from "../Continent.js";
import scroller from "../scroller.js";
import timeline from "./timeline.js";
import dispatcher from "../dispatcher.js";
import BlockDiagram from "./BlockDiagram";

export default class EpisodeAddAwareness extends Episode {
	//overload with additional content changes
	replaceContent(emotion, animate = false) {
		super.replaceContent(emotion, animate);
	}

	destroy() {
		super.destroy();
		this.addAwarenessButtonExperience.onclick = null;
		this.addAwarenessButtonResponse.onclick = null;
		this.refractoryPeriodButton.onclick = null;
		this.blockDiagramButton.onclick = null;

		this.hideAddAwarenessButtons();
		this.triggerAndResponseAwarenessTimeline.pause();
		this.triggerAndResponseAwarenessTimeline.seek(0);
		this.illuminationBlock.setAttribute("style", null);
	}

	//conputeIlluminationFadeWidth(){
	//	return this.getParentWidth()/30;
	//}

	initializeIllumination(svg) {
		//TODO remove for real from art file
		let illumination = svg.getElementById("illumination");
		timeline.remove(illumination);

		let event = timeline.select("#event", svg);
		let eventRect = event.getBoundingClientRect();
		this.illuminationBlock = document.createElement("div");
		this.illuminationBlock.id = "illumination-block";
		if (this.screenIsSmall) {
			let container = document.createElement("div");
			container.classList.add("illumination-container");
			container.appendChild(this.illuminationBlock);
			this.parent.insertBefore(container, svg);
			this.resizeIllumination();
		} else {
			let container = $("#app-container")[0];
			container.insertBefore(
				this.illuminationBlock,
				container.firstChild
			);
		}
	}

	onResize() {
		super.onResize();
		//this.resizeIllumination();
	}

	resizeIllumination() {
		$(".illumination-container").width(this.getSvgWidth());
		//let illuminationPosition = this.getStageIlluminationPercentage( this.awarenessStage );
		//this.moveIllumination( illuminationPosition, 0 );
	}

	getScrollElements() {
		if (!this.scrollElements) {
			this.scrollElements = [
				this.parent.querySelector("svg"),
				this.parent.querySelector(".illumination-container"),
			];
		}
		return this.scrollElements;
	}

	hide(onComplete) {
		this.hideIllumination();
		super.hide(onComplete);
	}

	hideIllumination(onComplete) {
		TweenMax.to(this.illuminationBlock, 1, {
			autoAlpha: 0,
			onComplete: onComplete,
		});
	}

	getStageIlluminationPoint(stage) {
		if (stage == "trigger") {
			let bounds = this.parent
				.querySelector("#state")
				.getBoundingClientRect();
			return 0.75 * bounds.left + 0.25 * bounds.right;
		}
		if (stage == "experience") {
			let bounds = this.parent
				.querySelector("#responses")
				.getBoundingClientRect();
			return 0.75 * bounds.left + 0.25 * bounds.right;
		}
		if (stage == "response") {
			let wrapperSvg = this.parent.querySelector("svg");
			let bounds = wrapperSvg.getBoundingClientRect();
			return bounds.right;
		}
		return null;
	}

	getStageIlluminationPercentage(stage) {
		let point = this.getStageIlluminationPoint(stage);
		let percentage = point
			? (100 * point) / this.getIlluminationContainerWidth()
			: 0;
		return percentage;
	}

	getIlluminationContainerWidth() {
		let container = this.illuminationBlock.parentNode;
		let bounds = container.getBoundingClientRect();
		return bounds.right - bounds.left;
	}

	moveIllumination(position, duration = 4) {
		return TweenMax.to(this.illuminationBlock, duration, {
			css: { right: 100 - position + "%" },
			ease: "power2.inOut",
		});
	}

	rewindState(timeline, onComplete) {
		this.stateCircles.forEach((circle, i) => {
			gsap.globalTimeline.to(circle, {
				attr: {
					rx: 0,
					ry: 0,
					opacity: 0,
				},
				ease:
					timeline.time() >= timeline.labels["pulsate"]
						? "back.in"
						: "power1.out",
				duration: 0.5,
				onComplete,
			});
		});
	}

	rewind(onComplete) {
		if (
			this.triggerAndResponseAwarenessTimeline &&
			this.awarenessStage !== "trigger" &&
			this.awarenessStage !== "experience"
		) {
			this.triggerAndResponseAwarenessTimeline.pause();
			this.triggerAndResponseAwarenessTimeline.seek("start");
		}
		if (this.refractoryIlluminationTimeline) {
			this.refractoryIlluminationTimeline.pause();
			this.refractoryIlluminationTimeline.seek(0);
		}
		super.rewind(() => {
			this.refractoryCirclesTimeline.seek(0);
			if (onComplete) onComplete();
		});
	}

	setupCirclesTimelines() {
		this.refractoryCirclesTimeline = gsap.timeline({ paused: true });

		const minStartingRadius = 0;
		const maxStartingRadius = 20;

		this.stateCircles.forEach((circle, i) => {
			let startingRadius =
				minStartingRadius +
				((maxStartingRadius - minStartingRadius) * i) /
					(this.stateCircles.length - 1);

			this.refractoryCirclesTimeline
				.set(
					circle,
					{
						attr: { rx: startingRadius, ry: startingRadius },
						autoAlpha: 0,
					},
					"emerge"
				)
				.to(
					circle,
					{
						duration: 0.5,
						attr: {
							rx: this.initialRadii[i],
							ry: this.initialRadii[i],
						},
						autoAlpha: 1,
						ease: "power2.in",
					},
					"emerge"
				)
				.to(
					circle,
					{
						duration: 1,
						attr: {
							rx: this.initialRadii[i] * 20,
							ry: this.initialRadii[i] * 20,
						},
						ease: "power2.out",
					},
					"expand"
				)
				.to(
					circle,
					{
						duration: 7,
						attr: {
							rx: this.initialRadii[i],
							ry: this.initialRadii[i],
						},
						ease: "power2.inOut",
					},
					"contract"
				);
		});
		this.addStatePulsation(this.refractoryCirclesTimeline);
	}

	constructor(svg, container, emotion, screenIsSmall) {
		super(svg, container, emotion, screenIsSmall);
	}

	setupTimeline({ withRefractoryPeriod }) {
		if (this.episodeTimeline) {
			gsap.killTweensOf(this.episodeTimeline);
			this.episodeTimeline.seek("end").pause();
			this.episodeTimeline.kill();
			this.stateCircles.forEach((circle, i) => {
				gsap.set(circle, {
					attr: {
						rx: 0,
						ry: 0,
						opacity: 0,
					},
				});
			});
		}

		let trigger = timeline.select("#trigger", this.timelineWithExamples);
		let responses = timeline.select(
			"#responses",
			this.timelineWithExamples
		);

		this.episodeTimeline = new gsap.timeline();

		let addResponseLineAwareness = function () {
			if (this.awarenessStage == "experience") {
				//reset center line color
				this.setResponseLineColor(1, true);
			}
			if (this.awarenessStage == "response") {
				for (let i = 0; i < this.responseLines.length; i++) {
					this.setResponseLinestyle(i, true);
					this.setResponseLinestyle(i, true);
					this.setResponseLineColor(i, true);
				}
				//show all lines and arrowheads
				gsap.globalTimeline.to(
					timeline.selectAll(
						'[id*="response-line-"]',
						this.timelineWithExamples
					),
					0,
					{ autoAlpha: 1 }
				);
			}
		};

		let addExperienceAwareness = function () {
			if (this.awarenessStage == "experience") {
				this.physicalChanges.style.visibility = "visible";
				this.mentalChanges.style.visibility = "visible";
			}
		};

		let addResponseAwareness = function () {
			if (this.awarenessStage == "response") {
				this.setTextColor(this.destructiveResponse, true);
			}
		};

		let showAddAwarenessButton = function () {
			if (
				this.awarenessStage == "trigger" &&
				this.addAwarenessButtonExperience.style.visibility == "hidden"
			) {
				TweenMax.to(this.addAwarenessButtonExperience, 1, {
					autoAlpha: 1,
					ease: "power2.out",
				});
			}
			if (
				this.awarenessStage == "experience" &&
				this.addAwarenessButtonResponse.style.visibility == "hidden"
			) {
				TweenMax.to(this.addAwarenessButtonResponse, 1, {
					autoAlpha: 1,
					ease: "power2.out",
				});
			}
			if (
				this.awarenessStage == "refractory" &&
				this.blockDiagramButton.style.visibility == "hidden"
			) {
				TweenMax.to(this.blockDiagramButton, 1, {
					autoAlpha: 1,
					ease: "power2.out",
				});
			}
		};

		//start the timeline
		this.episodeTimeline
			//show event
			.add("event")
			.from(trigger, 0.5, { autoAlpha: 0, ease: "power1.out" })

			.add("event-pulse")
			.to(
				timeline.select("#event-text", this.timelineWithExamples),
				0.1,
				{
					scale: 1.1,
					transformOrigin: "50% 50%",
					ease: "power1.out",
				}
			)
			.to(
				timeline.select("#event-text", this.timelineWithExamples),
				0.2,
				{
					scale: 1,
					transformOrigin: "50% 50%",
					ease: "power1.out",
				}
			)
			.to(
				timeline.select(
					"#perceptual-database-text",
					this.timelineWithExamples
				),
				0.1,
				{
					scale: 1.1,
					transformOrigin: "50% 50%",
					ease: "power1.out",
				},
				"-=0.25"
			)
			.to(
				timeline.select(
					"#perceptual-database-text",
					this.timelineWithExamples
				),
				0.2,
				{
					scale: 1,
					transformOrigin: "50% 50%",
					ease: "power1.out",
				}
			)
			.add("event-lines")
			.from(
				this.eventLineGroup,
				0.5,
				{ autoAlpha: 0, ease: "power1.out" },
				this.screenIsSmall ? "event-lines+=1.5" : "event-lines"
			);

		if (withRefractoryPeriod) {
			this.episodeTimeline.call(
				() => {
					if (!this.rewindActive) {
						this.refractoryCirclesTimeline.play();
					}
				},
				null,
				"state"
			);
		} else {
			this.addStateEmergence(this.episodeTimeline);
			this.episodeTimeline.addLabel("pulsate");
		}

		// show emo state
		this.episodeTimeline.call(() => {
			if (!this.rewindActive && this.screenIsSmall) {
				this.scrollSvgToStage("experience");
			}
		});

		this.episodeTimeline
			.call(addExperienceAwareness.bind(this), null, "state")
			.call(this.triggerRefractoryEffects.bind(this), null, "state")
			.from(changes, 2, { autoAlpha: 0, ease: "power1.out" }, "state")
			.from(
				this.stateLabel,
				2,
				{
					autoAlpha: 0,
					ease: "power1.out",
				},
				"state"
			);

		if (withRefractoryPeriod) {
			this.episodeTimeline.call(
				() => {
					if (this.rewindActive) {
						this.refractoryCirclesTimeline.pause();
						gsap.killTweensOf(this.refractoryCirclesTimeline);
						// this.episodeTimeline.pause();
						this.rewindState(
							this.refractoryCirclesTimeline
							// () => this.episodeTimeline.resume()
						);
					}
				},
				null,
				"state"
			);
		}

		this.episodeTimeline
			//show response
			.from(
				this.responseLineGroup,
				0.5,
				{
					autoAlpha: 0,
					ease: "power1.out",
					onStart: addResponseLineAwareness.bind(this),
					onComplete: () => {
						if (!this.rewindActive && this.screenIsSmall) {
							this.scrollSvgToStage("response");
						}
						addResponseAwareness.bind(this)();
					},
				},
				"-=1"
			)
			.from(
				responses,
				1,
				{ autoAlpha: 0, ease: "power1.out" },
				"response"
			)

			.add("end");

		if (withRefractoryPeriod) {
			this.episodeTimeline.seek(0);
		} else {
			this.addStatePulsation(this.episodeTimeline);
		}

		this.episodeTimeline
			.add("add-awareness-button")
			.call(showAddAwarenessButton.bind(this));
	}

	initialize(svg, container, emotion, screenIsSmall) {
		this.refractoryPeriodTime = 15;
		this.refractoryPeriodEnabled = false;
		//this.refractoryBlocks = [];

		if (svg) {
			// illumination
			this.illuminationBlock = timeline.select(
				"#illumination-block",
				document
			);
			//let illuminationGlow = timeline.select( '#glow', document );
			this.initializeIllumination(svg);

			//timeline with examples
			this.timelineWithExamples = timeline.select(
				"#timeline-with-examples",
				this.parent
			);

			//blocks
			let blockDiagram = new BlockDiagram(
				timeline.select("#blocks", this.parent),
				this.parent
			);

			this.content = timeline.episodeContent;

			// hide elements and prepare for animation
			gsap.globalTimeline.to(
				timeline.getChildren(
					timeline.select("#state", this.timelineWithExamples)
				),
				0,
				{ visibility: "hidden" }
			);

			//state
			this.state = timeline.select("#state", this.timelineWithExamples);
			this.stateLabel = timeline.select(
				"#state-label",
				this.timelineWithExamples
			);
			let bBox = state.getBBox();
			this.stateLabelCenter = bBox.x + bBox.width / 2;
			this.stateLabelChildren = timeline.getChildren(this.stateLabel);
			for (let i = 0; i < this.stateLabelChildren.length; i++) {
				this.stateLabelChildren[i].setAttribute(
					"x",
					this.stateLabelCenter
				);
				this.stateLabelChildren[i].setAttribute(
					"text-anchor",
					"middle"
				);
				if (i == 1) {
					this.stateLabelChildren[i].style.textTransform =
						"uppercase";
				}
			}

			this.initStateCircles();
			this.setupCirclesTimelines();

			//changes
			this.physicalChanges = timeline.select(
				"#physical-changes",
				this.timelineWithExamples
			);
			this.mentalChanges = timeline.select(
				"#mental-changes",
				this.timelineWithExamples
			);
			this.changes = timeline.select(
				"#changes",
				this.timelineWithExamples
			);
			this.physicalChanges.style.visibility = "hidden";
			this.mentalChanges.style.visibility = "hidden";

			//lines
			this.eventLineGroup = timeline.select(
				"#event-lines",
				this.timelineWithExamples
			);
			this.eventLines = [
				//timeline.select( "path#precondition-line", this.eventLineGroup ),
				timeline.select("path#event-line", this.eventLineGroup),
				//timeline.select( "path#perceptual-database-line", this.eventLineGroup )
			];
			this.eventLineDecorations = [
				//timeline.select( "path#precondition-line-decoration-1", this.eventLineGroup ),
				timeline.select(
					"path#event-line-decoration-1",
					this.eventLineGroup
				),
				//timeline.select( "path#perceptual-database-line-decoration-1", this.eventLineGroup )
			];
			this.responseLineGroup = timeline.select(
				"#response-lines",
				this.timelineWithExamples
			);
			this.responseLines = timeline.selectAll(
				"path:not([id*='decoration'])",
				this.responseLineGroup
			);
			this.responseLineDecorations = timeline.selectAll(
				"[id*='decoration']",
				this.responseLineGroup
			);

			//hide first and third lines and arrowheads
			gsap.globalTimeline.to(
				timeline.selectAll(
					'[id*="response-line-1"]',
					this.timelineWithExamples
				),
				0,
				{ autoAlpha: 0 }
			);
			gsap.globalTimeline.to(
				timeline.selectAll(
					'[id*="response-line-3"]',
					this.timelineWithExamples
				),
				0,
				{ autoAlpha: 0 }
			);

			this.event = timeline.select("#event", this.timelineWithExamples);
			this.precondition = timeline.select(
				"#precondition",
				this.timelineWithExamples
			);
			this.perceptualDatabase = timeline.select(
				"#perceptual-database",
				this.timelineWithExamples
			);
			this.constructiveResponse = timeline.select(
				"#constructive-response",
				this.timelineWithExamples
			);
			this.destructiveResponse = timeline.select(
				"#destructive-response",
				this.timelineWithExamples
			);
			this.ambiguousResponse = timeline.select(
				"#ambiguous-response",
				this.timelineWithExamples
			);

			//text
			this.triggerText = [
				timeline.select("tspan", this.precondition),
				timeline.select("tspan", this.event),
				timeline.select("tspan", this.perceptualDatabase),
			];
			this.statePhraseText = [this.stateLabelChildren[0]];
			this.stateNameText = [
				timeline.select("tspan", this.physicalChanges),
				this.stateLabelChildren[1],
				timeline.select("tspan", this.mentalChanges),
			];
			this.responseText = [
				timeline.select("tspan", this.constructiveResponse),
				timeline.select("tspan", this.destructiveResponse),
				timeline.select("tspan", this.ambiguousResponse),
			];

			//center diagram text for proper placement in translations
			let triggerTextCenter = 130; //taken from english design
			this.triggerText.forEach(function (tspan) {
				tspan.setAttribute("x", triggerTextCenter);
				tspan.setAttribute("text-anchor", "middle");
			});
			let textElements = [
				this.precondition,
				this.event,
				this.perceptualDatabase,
			];
			textElements.forEach(function (element) {
				TweenMax.set(element, { x: 0 });
			});
			bBox = this.changes.getBBox();
			let changesCenter = bBox.x + bBox.width / 2;
			[this.stateNameText[0], this.stateNameText[2]].forEach(function (
				tspan
			) {
				tspan.setAttribute("x", changesCenter);
				tspan.setAttribute("text-anchor", "middle");
			});

			//d3.selectAll( this.triggerText )
			//	.attr( 'text-anchor', 'middle' )
			//	.attr( 'x', function () {
			//		return parseFloat( this.getComputedTextLength() ) / 2 + parseFloat( this.getAttribute( 'x' ) );
			//	} );
			//d3.selectAll( this.stateNameText )
			//	.attr( 'text-anchor', 'middle' )
			//	.attr( 'x', function () {
			//		return parseFloat( this.getComputedTextLength() ) / 2 + parseFloat( this.getAttribute( 'x' ) );
			//	} );
			//
			//add awareness buttons

			this.addAwarenessButtonExperience = timeline.select(
				"#experience-add-awareness",
				document
			);
			this.addAwarenessButtonExperience.style.visibility = "hidden"; //TODO should these be handled in css? what's typical in this app?

			this.addAwarenessButtonResponse = timeline.select(
				"#response-add-awareness",
				document
			);
			this.addAwarenessButtonResponse.style.visibility = "hidden";

			this.refractoryPeriodButton = timeline.select(
				"#begin-refractory-period",
				document
			);
			this.refractoryPeriodButton.style.visibility = "hidden";

			this.blockDiagramButton = timeline.select(
				"#begin-block-diagram",
				document
			);
			this.blockDiagramButton.style.visibility = "hidden";

			let illuminationTimeline = new TimelineMax({});

			this.playFromStart = true; //TODO shared code with Episode

			let lineUnawareColor = "#fff";
			let lineAwareColor = timeline
				.select("#response-line-1", this.timelineWithExamples)
				.getAttribute("stroke");
			let textUnawareColor = "#fff";
			this.responseTextUnawareColor = textUnawareColor;
			let textAwareColor = timeline
				.select("#constructive-response", this.timelineWithExamples)
				.getAttribute("fill");

			this.setLineColor = function (
				line,
				decoration,
				color,
				duration = 0,
				timeline = gsap
			) {
				timeline.to(line, { duration, attr: { stroke: color } });
				timeline.to(decoration, { duration, attr: { stroke: color } });
			};

			this.setLineOpacity = function (
				line,
				decoration,
				autoAlpha,
				duration = 0,
				timeline = gsap
			) {
				timeline.to(line, { duration, autoAlpha });
				timeline.to(decoration, { duration, autoAlpha });
			};

			this.setResponseLineColor = function (
				lineIndex,
				aware,
				time = 0,
				timeline = gsap
			) {
				let color = aware ? lineAwareColor : lineUnawareColor;
				this.setLineColor(
					this.responseLines[lineIndex],
					this.responseLineDecorations[lineIndex],
					color,
					time,
					timeline
				);
			};

			this.setEventLineColor = function (
				lineIndex,
				aware,
				time = 0,
				timeline = gsap
			) {
				let color = aware ? lineAwareColor : lineUnawareColor;
				this.setLineColor(
					this.eventLines[lineIndex],
					this.eventLineDecorations[lineIndex],
					color,
					time,
					timeline
				);
			};

			this.setTextColor = function (
				textElement,
				aware,
				duration = 0,
				timeline = gsap
			) {
				let color = aware ? textAwareColor : textUnawareColor;
				timeline.to(textElement, { duration, attr: { fill: color } });
			};

			this.setResponseTextColor = function (
				textElement,
				aware,
				duration = 0,
				timeline = gsap
			) {
				let color = aware
					? textAwareColor
					: this.responseTextUnawareColor;
				timeline.to(textElement, { duration, attr: { fill: color } });
			}.bind(this);

			this.setResponseLinestyle = function (
				lineIndex,
				aware,
				timeline = gsap
			) {
				//solid if unaware
				if (aware) {
					timeline.set(this.responseLines[lineIndex], {
						attr: {
							"stroke-dasharray": "3,8",
						},
					});
				} else {
					timeline.set(this.responseLines[lineIndex], {
						attr: {
							"stroke-dasharray": "",
						},
					});
				}
			};

			this.playTriggerAndResponseAwareness = function () {
				if (!this.triggerAndResponseAwarenessTimeline) {
					return;
				}
				this.triggerAndResponseAwarenessTimeline.play("start");
			};

			this.setupTriggerAndResponseAwareness = function (duration = 0) {
				if (this.triggerAndResponseAwarenessTimeline) {
					return;
				}

				// these elements should not be visible during refractory period
				const unawareTextElements = [
					this.precondition,
					this.perceptualDatabase,
					this.physicalChanges,
					this.mentalChanges,
					this.constructiveResponse,
					this.ambiguousResponse,
					document.querySelector("#plus-1"),
					document.querySelector("#plus-2"),
				];

				this.triggerAndResponseAwarenessTimeline = gsap.timeline({
					paused: true,
				});

				const setCentralElementColors = (
					aware,
					duration,
					labelOrPosition
				) => {
					let color = aware ? lineAwareColor : lineUnawareColor;
					// center response line color
					this.triggerAndResponseAwarenessTimeline.to(
						this.responseLines[1],
						{ duration, attr: { stroke: color } },
						labelOrPosition
					);
					this.triggerAndResponseAwarenessTimeline.to(
						this.responseLineDecorations[1],
						{ duration, attr: { stroke: color } },
						labelOrPosition
					);
					// center line style
					if (aware) {
						this.triggerAndResponseAwarenessTimeline.set(
							this.responseLines[1],
							{
								attr: {
									"stroke-dasharray": "3,8",
								},
							},
							labelOrPosition
						);
					} else {
						this.triggerAndResponseAwarenessTimeline.set(
							this.responseLines[1],
							{
								attr: {
									"stroke-dasharray": "",
								},
							},
							labelOrPosition
						);
					}
					// center event line color
					this.triggerAndResponseAwarenessTimeline.to(
						this.eventLines[0],
						{ duration, attr: { stroke: color } },
						labelOrPosition
					);
					this.triggerAndResponseAwarenessTimeline.to(
						this.eventLineDecorations[0],
						{ duration, attr: { stroke: color } },
						labelOrPosition
					);
					// text colors
					const textColor = aware ? textAwareColor : textUnawareColor;
					this.triggerAndResponseAwarenessTimeline.to(
						this.event,
						{
							duration,
							attr: { fill: textColor },
						},
						labelOrPosition
					);
					this.triggerAndResponseAwarenessTimeline.to(
						this.destructiveResponse,
						{
							duration,
							attr: { fill: textColor },
						},
						labelOrPosition
					);
				};

				const setOtherElementColors = (
					aware,
					duration,
					labelOrPosition
				) => {
					// outer lines
					[0, 2].forEach((i) => {
						this.triggerAndResponseAwarenessTimeline.to(
							this.responseLines[i],
							{ duration, autoAlpha: aware ? 1 : 0 },
							labelOrPosition
						);
						this.triggerAndResponseAwarenessTimeline.to(
							this.responseLineDecorations[i],
							{
								duration,
								autoAlpha: aware ? 1 : 0,
							},
							labelOrPosition
						);
					});

					unawareTextElements.forEach((textElement) => {
						this.triggerAndResponseAwarenessTimeline.to(
							textElement,
							{
								duration,
								autoAlpha: aware ? 1 : 0,
							},
							labelOrPosition
						);
					});
				};

				setCentralElementColors(true, 0.1, "prerole");
				setOtherElementColors(true, 0.1, "prerole");

				setCentralElementColors(false, duration, "start");
				setOtherElementColors(false, duration, "start");
				//change central elements back early with a slow fade
				this.triggerAndResponseAwarenessTimeline.addLabel(
					"central-awareness",
					this.refractoryPeriodTime * 0.25
				);
				setOtherElementColors(true, duration * 10, "central-awareness");
				//change central elements back mid way through
				this.triggerAndResponseAwarenessTimeline.addLabel(
					"outer-awareness",
					this.refractoryPeriodTime * 0.5
				);
				setCentralElementColors(true, duration, "outer-awareness");
			};

			this.awarenessStage = "trigger";

			this.advance = function () {
				if (this.awarenessStage == "trigger") {
					let illuminationPosition =
						this.getStageIlluminationPercentage("experience");
					this.moveIllumination(illuminationPosition);
					this.awarenessStage = "experience";
				} else if (this.awarenessStage == "experience") {
					let illuminationPosition = 125;
					let illuminationTimeline = new TimelineMax({});

					// move illumination all the way off screen, starting with a smooth but quick acceleration
					// once it is finished illuminating the entire timeline, the block interactions are enabled
					illuminationTimeline
						.add("start")
						.add(this.moveIllumination(illuminationPosition))
						.add("finished")
						.call(() => {
							TweenMax.to(this.refractoryPeriodButton, 1, {
								autoAlpha: 1,
								ease: "power2.out",
							});
						});
					//if ( this.screenIsSmall ) {
					illuminationTimeline.fromTo(
						this.illuminationBlock,
						1,
						{ css: { backgroundColor: "rgba(255,255,255,0)" } },
						{
							css: { backgroundColor: "rgba(255,255,255,1)" },
							ease: "none",
						},
						"finished"
					);
					//} else {
					//	illuminationTimeline
					//		.to( this.illuminationBlock, 10, {
					//			css: { width: '+=3000' },
					//			ease: Power0.easeIn
					//		}, 'finished' )
					//}
					illuminationTimeline.add("end");

					this.awarenessStage = "response";
				} else if (this.awarenessStage == "response") {
					scroller.pulseEmotionNav();
					this.awarenessStage = "refractory";
				} else if (this.awarenessStage == "refractory") {
					this.awarenessStage = "blocks";
					timeline.allowMoreContent();
				}

				timeline.advanceAwarenessStage(this.awarenessStage);
			};

			this.advanceAndStart = function () {
				this.start();
				TweenMax.delayedCall(1, () => {
					this.advance();
				});
			};

			let enableBlockDiagram = function () {
				let clickableElements = [
					this.precondition,
					this.event,
					this.perceptualDatabase,
					this.physicalChanges,
					state,
					this.mentalChanges,
					this.constructiveResponse,
					this.destructiveResponse,
					this.ambiguousResponse,
				];
				blockDiagram.addMouseHandlers(clickableElements);
				this.refractoryBlocks = blockDiagram.getRefractoryBlocks();
				this.replayEnabled = false;
				this.refractoryPeriodEnabled = false;
				//timeline.toggleEmotionNav( false );
			};

			//pulsate illumination
			let pulsateIllumination = function () {
				gsap.globalTimeline.to(
					[this.illuminationBlock /*, glow */],
					1.9,
					{
						css: { x: "-=5" },
						repeat: -1,
						yoyo: true,
						repeatDelay: 0,
						ease: "power1.inOut",
					},
					"pulsate-illumination"
				);
			};

			this.hideAddAwarenessButtons = function () {
				let buttons = [
					this.addAwarenessButtonExperience,
					this.addAwarenessButtonResponse,
					this.blockDiagramButton,
				];
				buttons.forEach((b) => {
					b.style.visibility = "hidden";
					b.style.opacity = 0;
				});
			};

			let darkenTime = 0.25;

			this.setupTriggerAndResponseAwareness(darkenTime * 4);

			this.triggerRefractoryEffects = function () {
				if (!this.rewindActive && this.refractoryPeriodEnabled) {
					this.playTriggerAndResponseAwareness();

					//prepare the refractory period
					if (!this.refractoryIlluminationTimeline) {
						this.refractoryIlluminationTimeline = gsap.timeline({
							paused: true,
						});
						this.refractoryIlluminationTimeline
							.to(this.illuminationBlock, {
								duration: darkenTime,
								autoAlpha: 0,
								ease: "power3.inOut",
							})
							.to(this.illuminationBlock, {
								autoAlpha: 1,
								ease: "power3.inOut",
								duration: this.refractoryPeriodTime,
								onComplete: () => {
									scroller.pulseEmotionNav();
								},
							});
					}
					this.refractoryIlluminationTimeline.play(0);
				}
			};

			//start the illumination
			this.resizeIllumination();
			illuminationTimeline
				.add("illuminate")
				.fromTo(
					this.illuminationBlock,
					2,
					{ autoAlpha: 0 },
					{ autoAlpha: 1, ease: "power1.inOut" }
				)
				.add(
					this.moveIllumination(
						this.getStageIlluminationPercentage("trigger")
					),
					{
						onComplete: () => {
							pulsateIllumination.bind(this)();
						},
					},
					"illuminate"
				)
				.add("pulsate-illumination");

			this.setupCirclesTimelines();
			this.setupTimeline({
				withRefractoryPeriod: false,
			});

			let hideButton = function (button) {
				TweenMax.to(button, 1, {
					autoAlpha: 0,
					ease: "power2.out",
					//onComplete: function () {
					//	button.style.display = 'none';
					//}
				});
			};
			let awarenessClickCallback = function (e) {
				//if ( this.screenIsSmall ) {
				//	dispatcher.minimizeSectionText();
				//}
				hideButton(e.currentTarget);
				//reset and advance at start
				this.rewind(() => {
					if (this.awarenessStage === "response") {
						this.setupTimeline({
							withRefractoryPeriod: true,
						});
					}
					TweenMax.delayedCall(0.5, () => {
						this.advanceAndStart();
					});
				});
			};
			let refractoryPeriodClickCallback = function (e) {
				this.refractoryPeriodEnabled = true;
				awarenessClickCallback.bind(this)(e);
			};
			let blockDiagramClickCallback = function (e) {
				//if ( this.screenIsSmall ) {
				//	dispatcher.minimizeSectionText();
				//}
				hideButton(e.currentTarget);
				this.advance();
				enableBlockDiagram.bind(this)();
			};

			this.addAwarenessButtonExperience.onclick =
				awarenessClickCallback.bind(this);
			this.addAwarenessButtonResponse.onclick =
				awarenessClickCallback.bind(this);
			this.refractoryPeriodButton.onclick =
				refractoryPeriodClickCallback.bind(this);
			this.blockDiagramButton.onclick =
				blockDiagramClickCallback.bind(this);

			TweenMax.set(state, { visibility: "visible" });

			this.replaceContent(this.currentEmotion, false);
			this.fixEventLineOverlap(this.event, this.eventLines[0], timeline);

			TweenMax.set(this.parent, { visibility: "visible" });

			this.episodeTimeline.pause();
			TweenMax.delayedCall(2, () => {
				this.episodeTimeline.tweenTo("end");
			});

			this.isActive = true;
		}
	}
}
